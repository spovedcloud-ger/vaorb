import { useEffect } from 'react';

/** Stable public URL — works in dev, build, and Botpress (needs absolute URL) */
const BOT_AVATAR_URL = '/assets/THEVAURL.png';

const INJECT_JS = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
const INJECT_CSS = 'https://cdn.botpress.cloud/webchat/v1/inject.css';

const BOTPRESS_CONFIG = {
  composerPlaceholder: 'Chat with ABot',
  botConversationDescription: 'How may I help you today?',
  botId: '64b4e5d4-3fb4-4a5d-94f8-bf0a9b06c177',
  hostUrl: 'https://cdn.botpress.cloud/webchat/v1',
  messagingUrl: 'https://messaging.botpress.cloud',
  clientId: '64b4e5d4-3fb4-4a5d-94f8-bf0a9b06c177',
  webhookId: '0202dfba-9d55-47e6-9ffa-c6a0bb6ba5df',
  lazySocket: true,
  themeName: 'prism',
  botName: 'The VA Orbit',
  avatarUrl: BOT_AVATAR_URL,
  stylesheet:
    'https://webchat-styler-css.botpress.app/prod/code/332c73ba-4521-47c7-8bc8-28a8e80ceb8d/v28842/style.css',
  frontendVersion: 'v1',
  useSessionStorage: true,
  theme: 'prism',
  themeColor: '#2563eb',
};

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', resolve, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function waitForBotpressApi(maxMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.botpressWebChat?.init) {
        resolve(window.botpressWebChat);
        return;
      }
      if (Date.now() - start > maxMs) {
        reject(new Error('Botpress inject.js did not expose botpressWebChat.init'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function raiseFloatingButton() {
  document.querySelectorAll('.bpw-floating-button, .bpw-widget-btn').forEach((btn) => {
    btn.style.setProperty('bottom', '80px', 'important');
  });
}

/** Botpress styler CSS can override avatarUrl — force our logo in the header */
function applyChatLogo() {
  const logoUrl = `${window.location.origin}${BOT_AVATAR_URL}`;
  const selectors =
    '.bpw-header-avatar img, .bpw-header-avatar-icon, .bpw-bot-avatar img, .bpw-message-avatar img, .bpw-widget-header img';

  document.querySelectorAll(selectors).forEach((el) => {
    if (el.tagName === 'IMG') {
      el.src = logoUrl;
      el.alt = 'The VA Orbit';
    }
  });

  document.querySelectorAll('.bpw-header-avatar, .bpw-bot-avatar').forEach((el) => {
    el.style.backgroundImage = `url("${logoUrl}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.borderRadius = '50%';
    el.style.overflow = 'hidden';
    el.style.border = '2px solid #076fab';
    el.style.boxShadow = '0 2px 10px rgba(7, 111, 171, 0.35)';
  });
}

export function useBotpress() {
  useEffect(() => {
    let positionTimer;
    let cancelled = false;

    (async () => {
      try {
        loadStylesheet(INJECT_CSS);
        await loadScript(INJECT_JS);
        const api = await waitForBotpressApi();
        if (cancelled) return;

        const logoUrl = `${window.location.origin}${BOT_AVATAR_URL}`;

        if (!window.__vaorbitBotpressInitV3) {
          api.init({
            ...BOTPRESS_CONFIG,
            avatarUrl: logoUrl,
            allowedOrigins: [
              window.location.origin,
              'http://localhost:5173',
              'http://localhost:5174',
              'http://127.0.0.1:5173',
              'http://127.0.0.1:5174',
              'http://localhost:4173',
              'https://vaorb-merm.vercel.app',
              'https://thevaorbit.com',
              'https://www.thevaorbit.com',
            ],
          });
          window.__vaorbitBotpressInitV3 = true;
        }

        applyChatLogo();
        raiseFloatingButton();
        positionTimer = setInterval(() => {
          applyChatLogo();
          raiseFloatingButton();
        }, 800);
        setTimeout(() => clearInterval(positionTimer), 45000);
      } catch (err) {
        console.error('[Botpress] Failed to initialize:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (positionTimer) clearInterval(positionTimer);
    };
  }, []);
}
