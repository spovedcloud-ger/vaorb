const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const PRODUCTION_REDIRECT = 'https://thevaorbit.com';

function getRedirectUri() {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI || PRODUCTION_REDIRECT;
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  return new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
}

/** GET /api/oauth/google/start — redirect to Google sign-in */
exports.start = (req, res) => {
  const oauth2 = getOAuthClient();
  if (!oauth2) {
    return res.status(500).send('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET on server.');
  }

  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.redirect(url);
};

/** GET /api/oauth/google/callback?code=... — exchange code, show refresh token */
exports.callback = async (req, res) => {
  const oauth2 = getOAuthClient();
  if (!oauth2) {
    return res.status(500).send('Missing OAuth client credentials on server.');
  }

  const code = req.query.code;
  if (!code) {
    return res.status(400).send(
      'Missing ?code=. Open /api/oauth/google/start and sign in as accounts@thevaorbit.com first.'
    );
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      return res.status(400).send(
        'No refresh_token. Revoke app at https://myaccount.google.com/permissions and try /api/oauth/google/start again.'
      );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html><head><title>OAuth success</title></head>
<body style="font-family:sans-serif;max-width:720px;margin:40px auto;padding:0 20px;">
  <h1>Google Calendar connected</h1>
  <p>Add this to Vercel → Production environment variables, then redeploy:</p>
  <p><strong>GOOGLE_OAUTH_REFRESH_TOKEN</strong></p>
  <textarea readonly style="width:100%;height:120px;font-family:monospace;">${tokens.refresh_token}</textarea>
  <p>Also set <code>GOOGLE_CALENDAR_ID=accounts@thevaorbit.com</code> and
  <code>GOOGLE_OAUTH_REDIRECT_URI=${getRedirectUri()}</code></p>
  <p>After saving on Vercel, test a booking — each guest should get a unique meet.google.com link.</p>
</body></html>`);
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.status(500).send(`Token exchange failed: ${err.message}`);
  }
};
