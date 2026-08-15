# Cocktails

Collection of cocktail recipes and party menus, published with GitHub Pages.

The site is plain static HTML/CSS/JS — everything stays in Markdown and is rendered
in the browser. The homepage toggles between the cocktail list and the menu list.

## Adding a cocktail

1. Copy `cocktail-template.md` into `recipes/` as `your-cocktail-name.md`
   (lowercase, hyphen-separated — the filename becomes the URL slug).
2. Fill in the sections. Keep the `##` headings as-is; `recipe.html` maps each one
   to a page section.
3. Optionally add a hero image at `images/your-cocktail-name.jpg`.
4. Commit. The pre-commit hook regenerates the generated lists and `search-index.json`.

## Adding a menu

1. Copy `menu-template.md` into `menus/` as `your-event-name.md`.
2. Fill in the sections. `##` headings map to page sections; `###` headings become
   cards inside them, so keep both levels.
3. Link to a cocktail with `[[Cocktail Name]]`. The name is slugified and matched
   against the files in `recipes/`; unmatched links render as plain dashed text so
   typos are visible.
4. Optionally add a hero image at `images/menus/your-event-name.jpg`.
5. Commit.

Shopping list items can be checked off on the menu page; the state is stored in
`localStorage` per menu.

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
cocktail list, menu list, and search index stay correct even if the local hook is
skipped. `.nojekyll` keeps GitHub Pages from running the files through Jekyll.
