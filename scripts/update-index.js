const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, '..', 'recipes');
const indexFile = path.join(__dirname, '..', 'index.html');

function getRecipeFiles() {
  return fs.readdirSync(recipesDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(name => name.toLowerCase().endsWith('.md'))
    .filter(name => !name.startsWith('_'))
    .sort();
}

function buildCommitSetLine(files) {
  const quoted = files.map(name => `"${name}"`);
  return `    let commitSetRecipes = [${quoted.join(', ')}];`;
}

function updateIndexFile(files) {
  const html = fs.readFileSync(indexFile, 'utf8');
  const regex = /^[ \t]*let commitSetRecipes = \[.*\];\r?$/m;

  if (!regex.test(html)) {
    throw new Error('Unable to find the commitSetRecipes line in index.html');
  }

  const updated = html.replace(regex, buildCommitSetLine(files));
  fs.writeFileSync(indexFile, updated, 'utf8');
  console.log(`Updated index.html with ${files.length} cocktail(s).`);
}

updateIndexFile(getRecipeFiles());
