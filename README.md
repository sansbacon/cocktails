# Cocktails

Collection of cocktail recipes with personal notes, published with GitHub Pages.

The site is plain static HTML/CSS/JS — recipes stay in Markdown and are rendered
in the browser. Same architecture as the recipes site, with a cocktail-native
section layout and its own color palette.

## Adding a cocktail

1. Copy `cocktail-template.md` into `recipes/` as `your-cocktail-name.md`
   (lowercase, hyphen-separated — the filename becomes the URL slug).
2. Fill in the sections. Keep the `##` headings as-is; `recipe.html` maps each one
   to a page section.
3. Optionally add a hero image at `images/your-cocktail-name.jpg`.
4. Commit. The pre-commit hook regenerates `index.html` and `search-index.json`.

## Local setup

Enable the pre-commit hook once per clone:

```
git config core.hooksPath .githooks
```

Regenerate manually at any time:

```
npm run update-index
npm run build-search-index
```

Preview locally (needed for search — `fetch` of `search-index.json` fails over `file://`):

```
npx http-server .
```

## Deployment

GitHub Pages, **Settings → Pages → Deploy from a branch**, branch `main`, folder `/ (root)`.
Pushing to `main` publishes the site.

The `Build Search Index` GitHub Action re-runs `scripts/update-index.js` and
`scripts/build-search-index.js` on every push and commits the results, so the
cocktail list and search index stay correct even if the local hook is skipped.
`.nojekyll` keeps GitHub Pages from running the files through Jekyll.
