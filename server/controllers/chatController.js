const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'accounts@thevaorbit.com';

const SYSTEM_PROMPT = `You are the VAORB Assistant, the helpful AI assistant for The VA Orbit. 
You answer questions about web design, WordPress development, branding, AI automation, pricing plans, and how to get started.
Be concise, professional, and friendly. If asked about pricing, mention they can view plans on the site or book a free consult call.
For custom quotes or project details, encourage using the contact form or emailing ${CONTACT_EMAIL}.
Do not invent specific prices unless the user asks generally; suggest checking the Rates/Packages sections on the site.`;

function getAiConfig() {
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY;

  if (!apiKey) return null;

  const isGroq = Boolean(process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.AI_API_KEY);
  const baseUrl =
    process.env.AI_API_BASE_URL ||
    (isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1');
  const model =
    process.env.AI_MODEL ||
    (isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ''), model };
}

exports.getChatStatus = (req, res) => {
  const config = getAiConfig();
  res.json({
    enabled: Boolean(config),
    model: config?.model || null,
    provider: config ? (process.env.AI_API_BASE_URL ? 'custom' : process.env.GROQ_API_KEY ? 'groq' : 'openai') : null,
  });
};

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    const config = getAiConfig();

    if (!config) {
      return res.status(503).json({
        reply:
          `Hi! Live AI chat isn't configured on the server yet. Please use the contact form on this page or email ${CONTACT_EMAIL} — we'll respond quickly!`,
        configured: false,
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    const sanitized = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 2000),
      }));

    if (!sanitized.some((m) => m.role === 'user')) {
      return res.status(400).json({ message: 'At least one user message is required' });
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.7,
        max_tokens: 500,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AI API error:', data);
      return res.status(502).json({
        message: 'AI provider returned an error',
        reply:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment or contact us via the form below.",
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ message: 'Empty response from AI provider' });
    }

    res.json({ reply, configured: true });
  } catch (err) {
    console.error('Chat handler error:', err);
    res.status(500).json({
      message: 'Chat request failed',
      reply:
        `Something went wrong on our end. Please email ${CONTACT_EMAIL} and we'll help you directly.`,
    });
  }
};
