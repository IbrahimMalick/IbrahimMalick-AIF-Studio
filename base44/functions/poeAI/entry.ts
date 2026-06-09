// deno-lint-ignore-file no-undef
// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Available Poe models — confirmed working
const POE_MODELS = {
  video: [
    { id: 'veo-3', name: 'Veo 3', provider: 'Google' },
    { id: 'kling-v3', name: 'Kling V3', provider: 'Kuaishou' },
    { id: 'runway-gen-4.5', name: 'Runway Gen 4.5', provider: 'RunwayML' },
    { id: 'Wan-2.7', name: 'Wan 2.7', provider: 'Alibaba' },
    { id: 'Sora-2-Pro', name: 'Sora 2 Pro', provider: 'OpenAI' },
    { id: 'Kling-O3', name: 'Kling O3', provider: 'Kuaishou' },
    { id: 'Kling-v3-Pro', name: 'Kling v3 Pro', provider: 'Kuaishou' },
  ],
  llm: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek' },
    { id: 'qwen3.5-flash', name: 'Qwen 3.5 Flash', provider: 'Alibaba' },
  ],
};

// Call Poe using the OpenAI-compatible API (https://api.poe.com/v1)
async function callPoe(botName, message, apiKey, conversationHistory = []) {
  const messages = [
    ...conversationHistory.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.poe.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: botName,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Poe API ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response received from model.';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('POE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'POE_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action } = body;

    // ── List all models ──────────────────────────────────────────────
    if (action === 'list_models') {
      const { category } = body;
      if (category && POE_MODELS[category]) {
        return Response.json({ models: POE_MODELS[category], category });
      }
      return Response.json({ models: POE_MODELS });
    }

    // ── Debug raw response ───────────────────────────────────────────
    if (action === 'debug') {
      const { model = 'GPT-4o-Mini', message = 'Hello' } = body;
      const response = await fetch('https://api.poe.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: message }] }),
      });
      const rawText = await response.text();
      return Response.json({ status: response.status, raw: rawText.slice(0, 2000) });
    }

    // ── Chat with a model ────────────────────────────────────────────
    if (action === 'chat') {
      const { model = 'gpt-4o', message, conversation_history = [] } = body;
      if (!message) {
        return Response.json({ error: 'message is required' }, { status: 400 });
      }

      const reply = await callPoe(model, message, apiKey, conversation_history);
      return Response.json({ reply, model, usage: { tokens_estimated: Math.ceil(reply.length / 4) } });
    }

    // ── Generate image ───────────────────────────────────────────────
    if (action === 'generate_image') {
      const { model = 'DALL-E-3', prompt } = body;
      if (!prompt) {
        return Response.json({ error: 'prompt is required' }, { status: 400 });
      }

      const reply = await callPoe(model, prompt, apiKey);
      const urlMatch = reply.match(/https?:\/\/[^\s"'<>)]+(?:\.png|\.jpg|\.jpeg|\.webp|\.gif)/i);
      return Response.json({ reply, model, image_url: urlMatch ? urlMatch[0] : null });
    }

    // ── Generate video ───────────────────────────────────────────────
    if (action === 'generate_video') {
      const { model = 'veo-3', prompt } = body;
      if (!prompt) {
        return Response.json({ error: 'prompt is required' }, { status: 400 });
      }

      const reply = await callPoe(model, prompt, apiKey);
      // Match explicit video file extensions OR Poe CDN video paths (no extension)
      const urlMatch = reply.match(/https?:\/\/[^\s"'<>)\]]+(?:\.mp4|\.mov|\.webm|\.avi|poecdn\.net\/base\/video\/[^\s"'<>)\]]*)/i)
        || reply.match(/https?:\/\/[^\s"'<>)\]]+/i);
      const video_url = urlMatch ? urlMatch[0].replace(/[.,;]+$/, '') : null;
      return Response.json({ reply, model, video_url });
    }

    return Response.json({ error: 'Invalid action. Use: list_models, chat, generate_image, generate_video' }, { status: 400 });

  } catch (error) {
    console.error('Poe AI error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});