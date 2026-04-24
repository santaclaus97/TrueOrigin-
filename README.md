# TrueOrigin

TrueOrigin is a product authenticity app with:

- a React + Vite frontend
- an Express + MongoDB backend
- JWT-based auth
- Google sign-in for buyers
- unique product code verification

## Local setup

1. Create `backend/.env` from `backend/.env.example`.
2. Create `frontend/.env` from `frontend/.env.example`.
3. Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

4. Run the apps:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

If `VITE_API_URL` is blank, the frontend calls the current origin. That is useful for production when the built frontend is served by the backend.

## Deploy on Render

This repo includes `render.yaml` so you can deploy it as a single Render web service.

1. Create a MongoDB Atlas cluster and copy the connection string.
2. In Render, create a new Blueprint or Web Service from this GitHub repo.
3. Set these environment variables:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_ID`
   - `FRONTEND_URL`
4. Deploy. Render will:
   - install backend and frontend dependencies
   - build the Vite frontend
   - start the Express server
   - serve the built frontend from the same app

## Google OAuth

For Google sign-in to work, create a Web application OAuth client and add these under Authorized JavaScript origins:

- `http://localhost`
- `http://localhost:5173`
- your deployed Render URL
