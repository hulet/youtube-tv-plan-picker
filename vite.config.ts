import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'node:child_process';

function dataUpdatedDate(): string {
  try {
    // Last commit date that touched data/plans.json, ISO short form.
    const iso = execSync('git log -1 --format=%cs data/plans.json', { encoding: 'utf-8' }).trim();
    if (iso) return iso;
  } catch {}
  // Fallback for environments without git or when file is untracked.
  return new Date().toISOString().slice(0, 10);
}

export default defineConfig({
  plugins: [svelte()],
  define: {
    __DATA_UPDATED__: JSON.stringify(dataUpdatedDate()),
  },
});
