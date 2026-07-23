# Portfolio Copilot Vercel Setup

## Architecture

The portfolio Copilot uses this production flow:

Browser Copilot UI -> `/api/ai/chat` -> frontend Vercel rewrite -> production backend -> MongoDB portfolio context -> server-side AI provider.

The browser never receives AI provider keys. Public frontend variables may contain only public URLs and usernames.

## Required Frontend Variables

Set these on the main portfolio frontend project when using a direct backend URL:

```env
VITE_API_URL=https://nagoor-portfolio-api.vercel.app/api
VITE_PORTFOLIO_USERNAME=nagoor
```

The frontend `vercel.json` also proxies `/api/*` to the production backend. This keeps the Copilot working even if `VITE_API_URL` is missing, because the production fallback `/api` will still reach the backend instead of being rewritten to `index.html`.

## Required Backend Variables

Set these on the backend Vercel project. Use real values only in the Vercel Dashboard, never in Git:

```env
OPENROUTER_API_KEY=your_server_side_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://nagoor-personal-portfolio.vercel.app
OPENROUTER_SITE_NAME=Nagoor Portfolio Copilot
```

Alternative OpenAI provider variables are also supported by the backend:

```env
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Gemini is supported as the middle fallback provider:

```env
GEMINI_API_KEY=your_server_side_key
GEMINI_API_KEY_2=
GEMINI_API_KEYS=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

At least one server-side provider key must be configured. Do not use `VITE_` for provider secrets.

Provider fallback order:

1. OpenRouter primary key
2. OpenRouter backup keys from `OPENROUTER_API_KEY_2` and `OPENROUTER_API_KEYS`
3. Gemini primary key
4. Gemini backup keys from `GEMINI_API_KEY_2` and `GEMINI_API_KEYS`
5. OpenAI primary key
6. OpenAI backup keys from `OPENAI_API_KEYS`

Retryable failures include provider authentication problems, exhausted credits, rate limits, timeouts, network failures, and temporary 5xx provider errors. Invalid model configuration skips the remaining keys for that provider and moves to the next provider type. Safety-blocked prompts are not retried.

## Vercel Dashboard Steps

1. Open the backend project: `nagoor-portfolio-api`.
2. Go to Settings -> Environment Variables.
3. Add the backend provider variables for Production, Preview, and Development as needed.
4. Redeploy the backend after changing environment variables.
5. Open the main frontend project: `nagoor-personal-portfolio`.
6. Confirm `VITE_API_URL` and `VITE_PORTFOLIO_USERNAME` are set for Production.
7. Redeploy the frontend after changing environment variables.

## Health Checks

Backend AI health:

```text
https://nagoor-portfolio-api.vercel.app/api/ai/health
```

Expected when configured:

```json
{
  "success": true,
  "configured": true,
  "primaryProvider": "openrouter",
  "primaryModel": "openai/gpt-4o-mini",
  "providers": {
    "openrouter": true,
    "gemini": true,
    "openai": false
  }
}
```

Copilot chat:

```text
POST https://nagoor-portfolio-api.vercel.app/api/ai/chat?username=nagoor
```

Body:

```json
{
  "message": "hello",
  "history": [],
  "conversationId": "test"
}
```

## Local Development

Normal local setup:

```powershell
cd "C:\Users\Abdul Khader\Documents\Codex\2026-06-11\Nagoor_personal_portfolio\backend"
npm run dev

cd "C:\Users\Abdul Khader\Documents\Codex\2026-06-11\Nagoor_personal_portfolio\frontend"
npm run dev:vite
```

Use `frontend/.env` or a local environment variable for:

```env
VITE_API_URL=http://127.0.0.1:5000/api
VITE_PORTFOLIO_USERNAME=nagoor
```

## Troubleshooting

`Failed to fetch`:
Check that the frontend deployment has `VITE_API_URL`, or that `/api/*` is not being rewritten to `index.html`.

`configured: false` from `/api/ai/health`:
The backend is missing a server-side AI provider key. Add `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` in Vercel and redeploy.

Gemini is configured but not answering:
Confirm `GEMINI_API_KEY` is set only on the backend project, `GEMINI_MODEL` is valid, and `GEMINI_BASE_URL` is `https://generativelanguage.googleapis.com/v1beta`. Redeploy after every environment-variable change.

404:
Confirm the username is `nagoor` and the production seed has been run.

405:
Use `POST` for `/api/ai/chat`.

500 or 503:
Check backend runtime logs. The provider key, model, or provider endpoint may be invalid or unavailable.

CORS:
If calling the backend directly through `VITE_API_URL`, add the frontend production URL to backend CORS environment variables and redeploy. The `/api/*` frontend rewrite avoids browser CORS for the main portfolio.

API returning `index.html`:
Make sure the `/api/(.*)` rewrite appears before the SPA `/(.*)` rewrite in `frontend/vercel.json`.

## Security Notes

- Never commit `.env` files.
- Never expose provider keys through `VITE_` variables.
- Never place `GEMINI_API_KEY` in frontend code or frontend Vercel variables.
- The Copilot limits message length and history size.
- The backend keeps portfolio context public and filters private-looking fields before sending it to the AI provider.
- Provider errors are converted to safe user-facing messages.
