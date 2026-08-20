import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webDirectory = fileURLToPath(new URL('../', import.meta.url));
const baseUrl = process.env.SEO_AUDIT_BASE_URL ?? 'http://127.0.0.1:8787';
const readinessUrl = new URL('/robots.txt', baseUrl);
const wranglerPackage = JSON.parse(
  await readFile(
    fileURLToPath(
      import.meta.resolve('wrangler/package.json', import.meta.url),
    ),
    'utf8',
  ),
);
const wranglerDirectory = path.dirname(
  fileURLToPath(import.meta.resolve('wrangler/package.json', import.meta.url)),
);
const wranglerBin = path.join(wranglerDirectory, wranglerPackage.bin.wrangler);
const readinessTimeoutMs = 30_000;

function waitForExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    child.once('exit', resolve);
  });
}

async function stopWorker(worker) {
  if (!worker.pid || worker.exitCode !== null || worker.signalCode !== null)
    return;

  if (process.platform === 'win32') {
    worker.kill('SIGTERM');
  } else {
    process.kill(-worker.pid, 'SIGTERM');
  }

  const stopped = await Promise.race([
    waitForExit(worker).then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (stopped) return;

  if (process.platform === 'win32') {
    worker.kill('SIGKILL');
  } else {
    process.kill(-worker.pid, 'SIGKILL');
  }
  await waitForExit(worker);
}

async function waitUntilReady(worker, workerState) {
  const deadline = Date.now() + readinessTimeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    if (workerState.error) throw workerState.error;
    if (worker.exitCode !== null || worker.signalCode !== null) {
      throw new Error(
        `Wrangler exited before readiness (code ${worker.exitCode}, signal ${worker.signalCode}).`,
      );
    }

    try {
      const response = await fetch(readinessUrl, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.status === 200) return;
      lastError = new Error(`readiness returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(
    `Wrangler did not become ready at ${readinessUrl.href}: ${lastError?.message ?? 'no response'}`,
  );
}

function runOriginAudit() {
  return new Promise((resolve, reject) => {
    if (!process.env.npm_execpath) {
      reject(new Error('npm_execpath is required to run test:seo:origin.'));
      return;
    }
    const audit = spawn(
      process.execPath,
      [process.env.npm_execpath, 'run', 'test:seo:origin'],
      {
        cwd: webDirectory,
        env: { ...process.env, SEO_AUDIT_BASE_URL: baseUrl },
        stdio: 'inherit',
      },
    );
    audit.once('error', reject);
    audit.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Raw origin audit failed (code ${code}, signal ${signal ?? 'none'}).`,
        ),
      );
    });
  });
}

const worker = spawn(
  process.execPath,
  [wranglerBin, 'dev', '--local', '--port', new URL(baseUrl).port || '8787'],
  {
    cwd: webDirectory,
    env: { ...process.env, BROWSER: 'none' },
    detached: process.platform !== 'win32',
    stdio: 'inherit',
  },
);
const workerState = { error: undefined };
worker.on('error', (error) => {
  workerState.error = error;
});

try {
  await waitUntilReady(worker, workerState);
  await runOriginAudit();
} finally {
  await stopWorker(worker);
}
