const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin_ann_2026';

  if (password !== expectedPassword) {
    return res.status(401).json({ message: 'Invalid administrative password credentials' });
  }

  try {
    const payload = {
      admin: true
    };

    const secret = process.env.JWT_SECRET || 'carl_falle_strategic_secret_token_key_2026';
    
    jwt.sign(
      payload,
      secret,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: 'Welcome back, Admin Carl Falle!' });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server login error' });
  }
};

exports.verifyToken = async (req, res) => {
  res.json({ valid: true, admin: req.admin });
};
