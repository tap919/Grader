/**
 * Safe subprocess execution — no shell interpolation.
 */
import { spawn } from 'child_process';

export function runCommand(
  command: string,
  args: string[],
  timeoutMs = 120_000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Command timed out: ${command}`));
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

/** GitHub owner/repo slug — alphanumeric, dots, hyphens, underscores only. */
export const REPO_SLUG_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function assertValidRepoSlug(owner: string, repo: string): void {
  if (!REPO_SLUG_PATTERN.test(owner) || !REPO_SLUG_PATTERN.test(repo)) {
    throw new Error('Invalid repository owner or name');
  }
}
