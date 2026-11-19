# React + Vite

## API configuration

Set `VITE_API_URL` to the backend's absolute origin before starting the Vite
development server or building the frontend. For local development, put it in
`client/.env.local`. For Docker Compose, put it in the root `.env` file; Compose
passes it to the frontend image build. The value must use HTTP or HTTPS.

The backend reads its MongoDB connection string from `MONGO_URI` in
`server/.env`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## GitHub Actions deployment

The workflow runs build and lint checks on pushes and pull requests to `main`.
Pushes to `main` also publish both images to GitHub Container Registry and
deploy them to the Kubernetes cluster described in `k8s/expense-tracker.yaml`.
Configure the following in the repository's **Settings → Secrets and variables
→ Actions**:

- Optional repository variable `VITE_API_URL`: public HTTP(S) origin for the
  backend. If it is unset, CI builds with `http://localhost:5000`; that image
  is only suitable for build verification, not public use.
- Repository variable `DEPLOY_TO_KUBERNETES` set to `true` to enable deployment.
- Repository secrets `KUBE_CONFIG` and `MONGO_URI`: cluster kubeconfig and
  MongoDB connection string, required when deployment is enabled.

The cluster must be able to pull the published GHCR images (make the packages
public or configure an image-pull secret).
