import { build, context } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

const OUTDIR = path.join(__dirname, 'dist');

/** @type {import('esbuild').BuildOptions} */
const shared = {
  bundle: true,
  format: 'esm',
  target: 'chrome120',
  platform: 'browser',
  sourcemap: isProduction ? false : 'inline',
  minify: isProduction,
  legalComments: 'none',
  logLevel: 'info',
};

/** @type {import('esbuild').BuildOptions[]} */
const targets = [
  {
    ...shared,
    entryPoints: [path.join(__dirname, 'src/background/service-worker.ts')],
    outfile: path.join(OUTDIR, 'background/service-worker.js'),
  },
  {
    ...shared,
    entryPoints: [path.join(__dirname, 'src/content/content.ts')],
    outfile: path.join(OUTDIR, 'content/content.js'),
  },
  {
    ...shared,
    entryPoints: [path.join(__dirname, 'src/popup/popup.ts')],
    outfile: path.join(OUTDIR, 'popup/popup.js'),
  },
];

async function copyStatic() {
  await mkdir(OUTDIR, { recursive: true });

  await cp(
    path.join(__dirname, 'manifest.json'),
    path.join(OUTDIR, 'manifest.json')
  );

  await mkdir(path.join(OUTDIR, 'popup'), { recursive: true });
  await cp(
    path.join(__dirname, 'src/popup/popup.html'),
    path.join(OUTDIR, 'popup/popup.html')
  );

  await mkdir(path.join(OUTDIR, 'popup'), { recursive: true });
  await cp(
    path.join(__dirname, 'src/popup/popup.css'),
    path.join(OUTDIR, 'popup/popup.css')
  );

  await mkdir(path.join(OUTDIR, 'content'), { recursive: true });
  await cp(
    path.join(__dirname, 'src/content/warning.css'),
    path.join(OUTDIR, 'content/warning.css')
  );

  const iconsDir = path.join(__dirname, 'assets');
  if (existsSync(iconsDir)) {
    await cp(iconsDir, path.join(OUTDIR, 'assets'), { recursive: true });
  }
}

async function main() {
  if (!isWatch) {
    await rm(OUTDIR, { recursive: true, force: true });
  }

  if (isWatch) {
    const ctxs = await Promise.all(targets.map((t) => context(t)));
    await Promise.all(ctxs.map((c) => c.watch()));
    await copyStatic();
    console.log('[esbuild] watching for changes...');
  } else {
    await Promise.all(targets.map((t) => build(t)));
    await copyStatic();
    console.log(`[esbuild] build complete → ${path.relative(process.cwd(), OUTDIR)}`);
  }
}

main().catch((err) => {
  console.error('[esbuild] build failed:', err);
  process.exit(1);
});