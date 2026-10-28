# Public demo

The project domain **luzjs.dev** is registered through Cloudflare.
The production target is **https://demo.luzjs.dev**, using the Cloudflare Worker `luz-demo`.
The Quality workflow publishes it after a successful push to `main` passes all checks.

## Build and preview

From the repository root, after `npm ci`:

```sh
npm run build:demo
npm run preview:demo
```

Open `http://127.0.0.1:4173/`. The output is `apps/editor/dist/demo/`, containing the
editor, HTML entry point, JSON worker, schemas, licenses and the original rigid body playground.
The playground is the only bundled scene and loads automatically at startup.
It can be served directly by a static host. No development server or backend is required.
The preview binds only to localhost and serves missing files as 404 responses.

The build uses a temporary asset directory, never `public/assets/` or `local-assets/`.
It validates generated scenes against the current schemas and checks model references,
approved texture checksums and the 25 MiB hosting limit per file. Production source maps are disabled. The normal
editor development workflow still uses local Blender exports. A normal editor build
cleans `apps/editor/dist/`, so run `build:demo` again after that build.

The [showcase guide](SHOWCASE.md) describes the assets and controls. The scene uses
original geometry and bundled CC0 metal textures, with no external texture or environment requests.
The existing editor stylesheet requests the optional Outfit font from Google Fonts;
the UI falls back to sans-serif if it is unavailable. No application account is required.

## Hosting and releases

Use Cloudflare Workers Static Assets, with no Worker script, for the first release.
Serve the demo at **demo.luzjs.dev** and reserve **luzjs.dev** for the project page and
documentation. Both names can use the same static artifact initially if desired.
Asset paths are relative, so the build does not depend on either hostname.

Cloudflare's published free static-asset allowance covers this small demo: unlimited
static requests, up to 20,000 files per deployment and 25 MiB per file. This fits the
US$25/month hosting budget; registration and renewals are separate. Recheck prices and
limits before activation. See [billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

The [Wrangler configuration](wrangler.json) serves only `dist/demo/`, returns 404 for
missing assets, and attaches demo.luzjs.dev as a custom domain. Cloudflare manages its
DNS record and HTTPS certificate. The apex domain remains available for documentation.
Keep the default cache revalidation until asset filenames are content-hashed.

The Quality workflow uploads the demo artifact from a push to `main`. Its deploy job
waits for both the source checks and browser GPU tests to succeed, then downloads that
same revision's artifact. Pull requests never deploy. Production jobs run serially and
skip a revision if it is no longer the head of `main`.

Configure these encrypted GitHub Actions secrets in the `demo` environment, with
deployment branches restricted to `main`:

- `CLOUDFLARE_ACCOUNT_ID`: the account that holds luzjs.dev.
- `CLOUDFLARE_API_TOKEN`: a deployment token scoped to that account and the luzjs.dev zone,
  with account Workers Scripts Edit, zone Workers Routes Edit and Zone Read permissions.
  Keep the token out of Git. Worker script access applies to the entire selected account.

The initial token expires on October 27, 2027. Rotate it in Cloudflare and update the
environment secret before expiration; the already deployed site remains live if a token
expires, but new releases cannot deploy until credentials are updated.

The deploy job runs `npm run deploy:demo` using the pinned Wrangler dependency, then
checks HTTPS and the rigid body scene, plus 404 responses for missing files and the removed
materials scene. Verify startup and simulation controls in a WebGL2-capable browser after release.

For an authorized manual deployment, build first and authenticate with Wrangler or
the same environment variables, then run `npm run deploy:demo`. Normal releases should
use CI so the tested artifact is the one published.

For rollback, use the previous deployment in the Cloudflare dashboard or Wrangler's
rollback command, then revert the faulty source change before the next release.
