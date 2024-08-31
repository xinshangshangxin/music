import { readFile } from 'node:fs/promises';

async function parseScript(filePath: string) {
  const scriptContent = await readFile(filePath, 'utf-8');
  const name = (scriptContent.match(/@name\s*([^\n]+)/) || [])[1];
  const description = (scriptContent.match(/@description\s*([^\n]+)/) || [])[1];
  const author = (scriptContent.match(/@author\s*([^\n]+)/) || [])[1];
  const version = (scriptContent.match(/@version\s*([^\n]+)/) || [])[1];
  const homepage = (scriptContent.match(/@homepage\s*([^\n]+)/) || [])[1];

  return {
    name,
    description,
    version,
    author,
    homepage,
    rawScript: scriptContent,
  };
}

export { parseScript };
