const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const recipesDir = path.join(rootDir, 'recipes');
const menusDir = path.join(rootDir, 'menus');

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

function updateSentinel(html, varName, files) {
  const regex = new RegExp(`^([ \\t]*)let ${varName} = \\[.*\\];`, 'm');
  if (!regex.test(html)) {
    return null;
  }
  const list = files.map(name => `"${name}"`).join(', ');
  return html.replace(regex, (match, indent) => `${indent}let ${varName} = [${list}];`);
}

function updateFile(filename, sentinels) {
  const fullPath = path.join(rootDir, filename);
  let html = fs.readFileSync(fullPath, 'utf8');

  for (const [varName, files] of Object.entries(sentinels)) {
    const updated = updateSentinel(html, varName, files);
    if (updated === null) {
      throw new Error(`Unable to find the ${varName} line in ${filename}`);
    }
    html = updated;
  }

  fs.writeFileSync(fullPath, html, 'utf8');
}

const recipes = listMarkdown(recipesDir);
const menus = listMarkdown(menusDir);

updateFile('index.html', { commitSetRecipes: recipes, commitSetMenus: menus });
// menu.html needs the cocktail list so [[wiki links]] can be resolved
updateFile('menu.html', { commitSetRecipes: recipes });

console.log(`Updated index.html with ${recipes.length} cocktail(s) and ${menus.length} menu(s).`);
