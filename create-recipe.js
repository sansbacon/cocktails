// once document is loaded, get cocktail from file
$(document).ready(function() {

  // create markdown converter
  let md = new showdown.Converter();

  // extract which cocktail from url anchor
  let baseFilename = window.location.hash;
  baseFilename = baseFilename.replace('#', '');
  let filename = 'recipes/' + baseFilename + '.md';
  let fallbackFilename = 'recipes/' + baseFilename;

  // if there's a hero image available, load and display
  if (lookForHeroImage) {
    let src = 'images/' + baseFilename + '.jpg';
    let img = $('<img>').attr('src', src)
      .on('load', function() {
        // if, for various reasons, the image can't be loaded let us know
        if (!this.complete || typeof this.naturalWidth == 'undefined' || this.naturalWidth == 0) {
          console.warn('Error loading hero image! Might not exist for this cocktail, but if it does make sure the filename is the same as the recipe file and has a .jpg extension');
        }
        else {
          $('#heroimage').append(img);
        }
      });
  }

  // recipe files may still carry Jekyll-era YAML front matter
  function stripFrontMatter(text) {
    return text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  }

  // load the cocktail
  function loadRecipe(url) {
    $.ajax({
      url: url,
      success: function(recipe) {

        // convert markdown to html, split into sections
        // regex via: https://pineco.de/snippets/split-strings-and-keep-the-delimiter
        recipe = md.makeHtml(stripFrontMatter(recipe));
        let sections = recipe.split(/(?=<h)/);

        // iterate sections, add to body
        let foundTitle = false;
        for (let i in sections) {
          let section = sections[i];

          // regex to get id from header (auto-added by
          // the markdown parser)
          let idPattern = new RegExp('id="(.*?)"');
          let id = idPattern.exec(section);

          // remove id from header (for css later)
          section = section.replace(/\sid=".*?"/, '');

          // if this is the first section...
          if (!foundTitle) {
            id = 'title';
            foundTitle = true;

            // change page title too
            let elems = $(section);
            let pageTitle = elems[0].innerHTML + ' | Cocktails';
            $(document).prop('title', pageTitle);
          }
          // for all other sections, get id from regex match
          else {
            if (!id) {
              continue;
            }
            id = id[1];
          }

          // make any urls (in sections listed at the top)
          // that don't have link syntax into valid urls
          if (autoUrlSections.includes(id)) {
            section = linkify(section);
          }

          // place the html inside its section
          $('#' + id).html(section);
        }

        // a few more bits to nicen things up...

        // opt: remove cruft from source links
        if (shortenURLs) {
          $('#recommendedbrands a, #notes a').each(function() {
            let url = $(this).text();
            if (/^https?:\/\//i.test(url)) {
              $(this).text(getDomain(url));
            }
          });
        }

        // in the ingredients, make things in parentheses a
        // bit lighter
        $('#ingredients li').each(function() {
          let str = $(this).text();
          str = str.replace(/\(([^)]+)\)/g, '<span class="paren">($1)</span>');
          $(this).html(str);
        });

        // turn the comma-separated tag line into pills
        let tagText = $('#tags p').text();
        if (tagText) {
          let pills = tagText.split(',')
            .map(function(tag) { return tag.trim(); })
            .filter(function(tag) { return tag.length > 0; })
            .map(function(tag) { return '<li>' + tag + '</li>'; })
            .join('');
          $('#tags p').replaceWith('<ul class="tag-list">' + pills + '</ul>');
        }

        // click a step to highlight it
        $('#instructions li').click(function() {
          if ($(this).hasClass('highlight')) {
            $(this).removeClass('highlight');
          }
          else {
            $('.highlight').removeClass('highlight');
            $(this).addClass('highlight');
          }
        });
      },

      // no cocktail listed or some problem?
      // either try the fallback path or redirect to the main page
      error: function(xhr, status, err) {
        if (url === filename && fallbackFilename !== filename) {
          loadRecipe(fallbackFilename);
        } else {
          console.log(err);
          window.location.href = 'index.html';
        }
      }
    });
  }

  loadRecipe(filename);

  // L/R arrow keys shift the step highlight
  $(document).keydown(function(e) {
    switch (e.which) {
      case 37:                        // left
        var curr = $('.highlight');
        curr.removeClass('highlight');
        curr.prev().addClass('highlight');
        break;
      case 39:                        // right
        var curr = $('.highlight');
        curr.removeClass('highlight');
        curr.next().addClass('highlight');
        break;
      default:
        return;
    }
  });
});
