const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const recipesDir = path.join(rootDir, 'recipes');
const menusDir = path.join(rootDir, 'menus');
const outputFile = path.join(rootDir, 'search-index.json');

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(name => name.toLowerCase().endsWith('.md'))
    .filter(name => !name.startsWith('_'))
    .sort();
}

function stripFrontMatter(markdown) {
  return markdown.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function extractTitle(markdown, filename) {
  const titleLine = markdown.split('\n').find(line => line.trim().startsWith('# '));
  if (titleLine) {
    return titleLine.replace(/^#\s+/, '').trim();
  }
  return filename.replace(/\.md$/i, '').replace(/-/g, ' ');
}

function extractTags(markdown) {
  const match = markdown.match(/^##[ \t]+tags[ \t]*\r?\n([\s\S]*?)(?=\r?\n##[ \t]|$)/im);
  if (!match) {
    return '';
  }
  return match[1]
    .replace(/^[\s*\-]+/gm, '')
    .split(/[,\n]/)
    .map(tag => tag.trim())
    .filter(Boolean)
    .join(' ');
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/\r/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^\)]+\)/g, ' $1 ')
    .replace(/>\s?/g, ' ')
    .replace(/[#*\-~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDocs(dir, type, page) {
  return listMarkdown(dir).map(filename => {
    const content = stripFrontMatter(fs.readFileSync(path.join(dir, filename), 'utf8'));
    return {
      title: extractTitle(content, filename),
      url: `${page}#${filename.replace(/\.md$/i, '')}`,
      type: type,
      tags: extractTags(content),
      content: stripMarkdown(content),
    };
  });
}

const docs = [
  ...buildDocs(recipesDir, 'cocktail', 'recipe.html'),
  ...buildDocs(menusDir, 'menu', 'menu.html'),
];

fs.writeFileSync(outputFile, JSON.stringify(docs, null, 2) + '\n', 'utf8');
console.log(`Wrote ${docs.length} documents to ${outputFile}`);
