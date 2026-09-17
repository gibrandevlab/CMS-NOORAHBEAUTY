import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(projectRoot, 'src/environments/environment.generated.ts');

// Support VITE_API_URL, API_URL, NEXT_PUBLIC_API_URL, or fallback to localhost
const rawApiUrl =
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.PUBLIC_API_URL ||
  'http://localhost:3000';

const configuredApiUrl = rawApiUrl.trim();
const apiUrl = configuredApiUrl.replace(/\/$/, '').endsWith('/api')
  ? configuredApiUrl.replace(/\/$/, '')
  : `${configuredApiUrl.replace(/\/$/, '')}/api`;

const assetUrl = apiUrl.replace(/\/api$/, '');

const contents = `export const apiUrl = ${JSON.stringify(apiUrl)};\nexport const assetUrl = ${JSON.stringify(assetUrl)};\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, contents, 'utf8');
console.log(`Generated Angular API config for ${apiUrl}`);
