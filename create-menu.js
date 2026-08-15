// once document is loaded, get the menu from file
$(document).ready(function() {

  let md = new showdown.Converter();

  let baseFilename = window.location.hash.replace('#', '');
  let filename = 'menus/' + baseFilename + '.md';

  // cocktail slugs available for [[wiki link]] resolution
  let cocktailSlugs = (typeof commitSetRecipes === 'undefined' ? [] : commitSetRecipes)
    .map(function(name) { return name.replace(/\.md$/i, ''); });

  if (lookForHeroImage) {
    let src = 'images/menus/' + baseFilename + '.jpg';
    let img = $('<img>').attr('src', src)
      .on('load', function() {
        if (this.complete && this.naturalWidth > 0) {
          $('#heroimage').append(img);
        }
      });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function slugify(str) {
    return str.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  function stripFrontMatter(text) {
    return text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  }

  // [[Cocktail Name]] becomes a link when a matching recipe exists,
  // otherwise it stays visible as unresolved so typos are obvious
  function resolveWikiLinks(markdown) {
    return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function(match, target, label) {
      let name = (label || target).trim();
      let slug = slugify(target);
      if (cocktailSlugs.indexOf(slug) !== -1) {
        return '[' + name + '](recipe.html#' + slug + ')';
      }
      return '<span class="unlinked" title="No cocktail named &quot;' + escapeHtml(name) + '&quot; yet">' + escapeHtml(name) + '</span>';
    });
  }

  // wrap each h3 and the content that follows it into its own card,
  // leaving the section's h2 outside the group
  function groupSubsections(id) {
    let section = document.getElementById(id);
    if (!section) {
      return;
    }

    let head = '';
    let cards = '';
    let current = null;

    Array.prototype.forEach.call(section.children, function(node) {
      if (node.tagName === 'H2') {
        head += node.outerHTML;
        return;
      }
      if (node.tagName === 'H3') {
        if (current !== null) {
          cards += '<div class="subsection">' + current + '</div>';
        }
        current = node.outerHTML;
        return;
      }
      if (current !== null) {
        current += node.outerHTML;
      } else {
        head += node.outerHTML;
      }
    });

    if (current !== null) {
      cards += '<div class="subsection">' + current + '</div>';
    }
    if (cards) {
      section.innerHTML = head + '<div class="subsections">' + cards + '</div>';
    }
  }

  // turn "Label: value" list items into label/value pairs
  function splitFields(selector) {
    $(selector).each(function() {
      let html = $(this).html();
      let match = html.match(/^([^:<]{1,32}):\s*([\s\S]*)$/);
      if (!match) {
        return;
      }
      $(this).addClass('field')
        .html('<span class="field-label">' + match[1].trim() + '</span>' +
              '<span class="field-value">' + match[2].trim() + '</span>');
    });
  }

  function decorateFields() {
    $('.field').each(function() {
      let label = $(this).find('.field-label').text().toLowerCase();
      let $value = $(this).find('.field-value');
      let text = $value.text().trim();

      if (label === 'abv' && text) {
        let levels = { low: 1, medium: 2, high: 3 };
        let filled = levels[text.toLowerCase()] || 0;
        let dots = '';
        for (let i = 1; i <= 3; i++) {
          dots += '<span class="dot' + (i <= filled ? ' on' : '') + '"></span>';
        }
        $value.html('<span class="abv-meter" aria-hidden="true">' + dots + '</span>' +
                    '<span class="abv-label">' + escapeHtml(text) + '</span>');
      }
      else if (label === 'flavor' && text) {
        let pills = text.split(',')
          .map(function(part) { return part.trim(); })
          .filter(Boolean)
          .map(function(part) { return '<li>' + escapeHtml(part) + '</li>'; })
          .join('');
        $value.html('<ul class="tag-list">' + pills + '</ul>');
      }
      else if (label === 'prep method' && text) {
        $value.html('<span class="badge ' + slugify(text) + '">' + escapeHtml(text) + '</span>');
      }
      else if (!text) {
        $(this).addClass('blank');
      }
    });
  }

  function setupShoppingList() {
    let storageKey = 'cocktails:shopping:' + baseFilename;
    let checked = [];

    if (rememberShoppingList) {
      try {
        checked = JSON.parse(window.localStorage.getItem(storageKey)) || [];
      } catch (err) {
        checked = [];
      }
    }

    let $items = $('#shoppinglist li');
    $items.each(function() {
      if (checked.indexOf($(this).text().trim()) !== -1) {
        $(this).addClass('checked');
      }
    });

    $items.click(function() {
      $(this).toggleClass('checked');
      if (!rememberShoppingList) {
        return;
      }
      let done = $('#shoppinglist li.checked').map(function() {
        return $(this).text().trim();
      }).get();
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(done));
      } catch (err) {
        // private browsing or storage full; checking off still works for this visit
      }
    });
  }

  $.ajax({
    url: filename,
    success: function(menu) {

      let html = md.makeHtml(resolveWikiLinks(stripFrontMatter(menu)));

      // split on h1/h2 only, so the h3 subsections stay with their parent
      let sections = html.split(/(?=<h[12](?:\s|>))/);

      let foundTitle = false;
      for (let i in sections) {
        let section = sections[i];
        let id = /id="(.*?)"/.exec(section);
        section = section.replace(/\sid=".*?"/, '');

        if (!foundTitle) {
          id = 'title';
          foundTitle = true;
          $(document).prop('title', $(section)[0].innerHTML + ' | Menus');
        }
        else if (id) {
          id = id[1];
        }
        else {
          continue;
        }

        let target = document.getElementById(id);
        if (target) {
          target.innerHTML = section;
        }
      }

      groupSubsections('menusummary');
      groupSubsections('cocktails');
      groupSubsections('shoppinglist');

      splitFields('#eventdetails li, #menusummary li, #cocktails li');
      decorateFields();
      setupShoppingList();

      let tagText = $('#tags p').text();
      if (tagText) {
        let pills = tagText.split(',')
          .map(function(tag) { return tag.trim(); })
          .filter(Boolean)
          .map(function(tag) { return '<li>' + escapeHtml(tag) + '</li>'; })
          .join('');
        $('#tags p').replaceWith('<ul class="tag-list">' + pills + '</ul>');
      }
    },

    error: function(xhr, status, err) {
      console.log(err);
      window.location.href = 'index.html?view=menus';
    }
  });
});
