const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, '..', 'recipes');
const outputFile = path.join(__dirname, '..', 'search-index.json');

function slugToUrl(slug) {
  const baseName = slug.replace(/\.md$/i, '');
  return `recipe.html#${baseName}`;
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

function buildIndex() {
  const files = fs.readdirSync(recipesDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(name => name.toLowerCase().endsWith('.md'))
    .filter(name => !name.startsWith('_'))
    .sort();

  const docs = files.map(filename => {
    const fullPath = path.join(recipesDir, filename);
    const content = stripFrontMatter(fs.readFileSync(fullPath, 'utf8'));
    return {
      title: extractTitle(content, filename),
      url: slugToUrl(filename),
      tags: extractTags(content),
      content: stripMarkdown(content),
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(docs, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${docs.length} documents to ${outputFile}`);
}

buildIndex();
