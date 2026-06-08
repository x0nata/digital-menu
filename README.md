# Digital Menu

Restaurant menu frontend built with React + Vite and backed by Convex.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Set your Convex values in `.env.local`.

4. Start dev server:

```bash
npm run dev
```

## Vercel deployment

This project is configured for Vercel static hosting with SPA routing.

1. Import the project in Vercel.
2. Set framework preset to `Vite` (usually auto-detected).
3. Add these environment variables in Vercel:
   - `VITE_CONVEX_URL`
   - `VITE_CONVEX_SITE_URL`
4. Deploy.

`vercel.json` includes a rewrite so routes like `/admin` load `index.html` correctly.
