import { mkdir, copyFile, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'public');
const publicFiles = ['index.html', 'style.css', 'app.js', 'payment.js', 'deployment-check.html'];
const paymentSource = await readFile(path.join(root, 'payment.js'), 'utf8');
if (!/^const DEV_MODE = false;$/m.test(paymentSource)) {
  throw new Error('Production build stopped: payment.js must keep DEV_MODE = false.');
}
await mkdir(output, { recursive: true });
const unexpected = (await readdir(output)).filter(name => !publicFiles.includes(name));
if (unexpected.length) {
  throw new Error(`Production build stopped: unexpected files in public/: ${unexpected.join(', ')}`);
}
for (const file of publicFiles) {
  await copyFile(path.join(root, file), path.join(output, file));
}
console.log('Public assets built. Server report source remains outside public/.');
