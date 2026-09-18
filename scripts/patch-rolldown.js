import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rolldownSharedDir = path.join(rootDir, 'node_modules', 'rolldown', 'dist', 'shared');

if (fs.existsSync(rolldownSharedDir)) {
  const files = fs.readdirSync(rolldownSharedDir);
  const targetFiles = files.filter(f => f.startsWith('create-bundler-option-') && f.endsWith('.mjs'));

  targetFiles.forEach(file => {
    const filePath = path.join(rolldownSharedDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const oldCode = 'function styleText$1(...args) {\n\treturn styleText(...args);\n}';
    const replacement = `function styleText$1(format, text) {
\tif (Array.isArray(format)) {
\t\treturn format.reduce((acc, f) => {
\t\t\ttry { return styleText(f, acc); } catch (_) { return acc; }
\t\t}, text);
\t}
\ttry {
\t\treturn styleText(format, text);
\t} catch (_) {
\t\treturn text;
\t}
}`;

    if (content.includes(oldCode)) {
      content = content.replace(oldCode, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[patch-rolldown] Successfully patched ${file} for Node 20.12 compatibility.`);
    } else {
      console.log(`[patch-rolldown] ${file} already patched or up-to-date.`);
    }
  });
}
