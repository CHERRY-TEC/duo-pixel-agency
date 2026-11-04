/**
 * Target-aware production build.
 *
 *   APP_TARGET=site    -> public website only, written to dist/
 *   APP_TARGET=portal  -> client/designer portal only, written to dist/
 *   (unset)            -> all three builds (combined dist/ + dist/site + dist/portal)
 *
 * Vercel runs one project per app; each project sets APP_TARGET as a project
 * env var so both can keep the default build command (`npm run build`) and
 * output directory (`dist`). Locally nothing changes: without APP_TARGET the
 * full combined build runs, exactly as before.
 */
import { execSync } from 'node:child_process';

const target = process.env.APP_TARGET ?? '';

const steps = {
  site: 'npm run build:site',
  portal: 'npm run build:portal',
  '': 'npm run build:all',
};

const step = steps[target];
if (!step) {
  console.error(
    `Unknown APP_TARGET "${target}". Use "site", "portal", or leave it unset.`,
  );
  process.exit(1);
}

console.log(`[build] APP_TARGET=${target || '(all)'} -> ${step}`);
execSync(step, { stdio: 'inherit' });
