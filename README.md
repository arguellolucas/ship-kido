### AI ship-kido

This is the AI ship-kido app integration.

Server user and pwd is: admin - admin123

---

### Staging Deployment (`deploy-staging.yml`)

The app includes a multi-stage `Dockerfile` and a GitHub Actions workflow (`.github/workflows/deploy-staging.yml`) that triggers whenever code is pushed to the `staging` branch or manually triggered via **Actions → Run workflow**.

#### Where can the staging environment run?
Because this app is a full-stack Node.js application (Express server on port 3000 + Vite client), it needs a container or Node runtime:

1. **Option A: Render / Railway / Koyeb (Recommended for simplicity)**
   * Create a Web Service connected to your repo (or Dockerfile).
   * Copy the **Deploy Hook URL**.
   * In GitHub Settings → Secrets and variables → Actions, add `STAGING_DEPLOY_HOOK_URL`.
   * GitHub Actions will trigger deployment whenever CI passes on `staging`.

2. **Option B: Google Cloud Run (Serverless container)**
   * Uses the included `Dockerfile` running on port 3000.
   * Free tier includes 2M requests/month and scales to zero when idle.
   * Add `GCP_SA_KEY` in GitHub Secrets and uncomment the Cloud Run step in `deploy-staging.yml`.

