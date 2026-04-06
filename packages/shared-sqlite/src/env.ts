import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { config as loadDotenv } from 'dotenv';

let loaded = false;

export const resolveWorkspaceRoot = () => {
  let currentPath = process.cwd();

  while (true) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          readFileSync(packageJsonPath, 'utf8'),
        ) as { workspaces?: string[] };

        if (Array.isArray(packageJson.workspaces)) {
          return currentPath;
        }
      } catch {
        // keep walking upward until a valid workspace root is found
      }
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      return process.cwd();
    }

    currentPath = parentPath;
  }
};

export const ensureWorkspaceEnv = () => {
  if (loaded) {
    return;
  }

  let currentPath = resolveWorkspaceRoot();
  let envPath: string | null = null;

  while (true) {
    const candidate = path.join(currentPath, '.env');

    if (existsSync(candidate)) {
      envPath = candidate;
      break;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }

    currentPath = parentPath;
  }

  if (envPath) {
    loadDotenv({ path: envPath, quiet: true });
  }

  loaded = true;
};
