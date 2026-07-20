# Nagoor Personal Portfolio Deployment

This portfolio uses MongoDB as the primary database. Do not migrate the app to Supabase for deployment.

## Projects

Deploy as separate Vercel projects:

- `backend/` as the API project.
- `frontend/` as the public portfolio project.
- `admin-dashboard/` as the private admin project, if needed.

## Backend Environment Variables

Set these in the backend Vercel project:

```bash
NODE_ENV=production
MONGO_URI=<production MongoDB URI>
JWT_SECRET=<strong random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-portfolio-frontend.vercel.app
ADMIN_URL=https://your-portfolio-admin.vercel.app
EXTRA_CLIENT_URLS=https://your-custom-domain.com
OPENROUTER_API_KEY=<primary provider key>
OPENROUTER_API_KEY_2=<backup provider key>
OPENROUTER_API_KEYS=<optional comma-separated provider keys>
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://your-portfolio-frontend.vercel.app
OPENROUTER_SITE_NAME=Nagoor Portfolio Copilot
OPENROUTER_ALLOW_INSECURE_TLS=false
OPENAI_API_KEY=<fallback provider key>
OPENAI_API_KEYS=<optional comma-separated provider keys>
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
JINA_API_KEY=<optional jina key>
SUPADATA_API_KEY=<optional supadata key>
VOYAGE_API_KEY=<optional voyage key>
ADMIN_NAME=Mohammed Nagoor Meerasha
ADMIN_USERNAME=nagoor
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MEDIA_STORAGE_PROVIDER=local
```

## Frontend Environment Variables

Set these in the public frontend Vercel project:

```bash
VITE_API_URL=https://your-portfolio-backend.vercel.app/api
VITE_PORTFOLIO_USERNAME=nagoor
```

## Admin Environment Variables

Set these in the admin Vercel project:

```bash
VITE_API_URL=https://your-portfolio-backend.vercel.app/api
VITE_PUBLIC_PORTFOLIO_URL=https://your-portfolio-frontend.vercel.app/home
```

## Verification

After deployment:

- Backend health: `https://your-portfolio-backend.vercel.app/api/health`
- Public portfolio: `https://your-portfolio-frontend.vercel.app/home`
- Admin dashboard: `https://your-portfolio-admin.vercel.app`
- Copilot: ask a project, STAR, or 5W1H question and confirm a live answer.
