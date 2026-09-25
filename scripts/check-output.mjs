import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)));
  return nested.flat();
}

const refs = (html) => [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
const ids = (html) => new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));

export async function checkOutput(rootPath) {
  const root = resolve(rootPath instanceof URL ? fileURLToPath(rootPath) : rootPath);
  const files = await walk(root);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  let links = 0;
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    for (const ref of refs(html)) {
      if (/^(?:https?:|mailto:|tel:|data:)/i.test(ref)) continue;
      links += 1;
      const [pathPart, fragment] = ref.split('#', 2);
      let target = pathPart ? resolve(dirname(htmlFile), decodeURIComponent(pathPart)) : htmlFile;
      const rel = relative(root, target);
      if (rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`${htmlFile}: link escapes generated site: ${ref}`);
      try {
        const info = await stat(target);
        if (info.isDirectory()) target = join(target, 'index.html');
        await stat(target);
      } catch {
        throw new Error(`${htmlFile}: missing local target: ${ref}`);
      }
      if (fragment && target.endsWith('.html')) {
        const targetHtml = target === htmlFile ? html : await readFile(target, 'utf8');
        if (!ids(targetHtml).has(decodeURIComponent(fragment))) throw new Error(`${htmlFile}: missing fragment target: ${ref}`);
      }
    }
  }
  return { files: files.length, links };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const result = await checkOutput(new URL('../dist/', import.meta.url));
  console.log(`Checked ${result.files} files and ${result.links} local links.`);
}
