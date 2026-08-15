# Cocktails

Collection of cocktail recipes with personal notes, ready to publish with GitHub Pages.

## GitHub Pages

This repository is structured for GitHub Pages/Jekyll:

- `index.md` is the homepage.
- `recipes/` contains recipe pages.
- `recipes/template.md` is the reusable cocktail recipe template.

In GitHub, enable **Settings → Pages** and set the source to **Deploy from a branch** using the `main` branch (`/root`).

## Template

```
---
layout: page
title: "Cocktail Name"
---

## Summary

Short description of the cocktail and flavor profile.

## Glassware

e.g. Coupe, Highball, Rocks

## Ingredients

- 2 oz Base spirit
- 3/4 oz Citrus juice
- 1/2 oz Sweetener
- 2 dashes Bitters

## Garnish

e.g. Citrus peel, cherry, mint sprig

## Recommended Brands

- **Base spirit:** Brand A, Brand B
- **Liqueur/modifier:** Brand C
- **Bitters:** Brand D

## Equipment

- Jigger
- Shaker or mixing glass
- Strainer

## Instructions

1. Add ingredients to shaker/mixing glass.
2. Shake or stir with ice.
3. Strain into chilled glass.
4. Garnish and serve.

## Notes

- Variations
- Personal adjustments

## Tags

e.g. sour, stirred, gin, rum, low-ABV
```
