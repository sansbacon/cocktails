// builds the cocktail and menu lists on the homepage, plus the toggle
// that swaps between them
$(document).ready(function() {

  function buildList($view, files, page) {
    let items = '';
    let letters = '';
    let prevLetter = '';

    for (let i in files) {
      let url = files[i];

      // skip files that start with underscore
      // (such as the _template.md file)
      if (url[0] === '_') {
        continue;
      }

      let anchor = url.replace(/\.md$/i, '');
      let name = anchor.split('-').join(' ');

      let firstLetter = name.charAt(0).toUpperCase();
      if (firstLetter !== prevLetter) {
        items += '<li id="' + firstLetter + '">';
        letters += '<a href="#' + firstLetter + '">' + firstLetter + ' </a>';
      }
      else {
        items += '<li>';
      }

      items += '<a href="' + page + '#' + anchor + '">' + name + '</a></li>';
      prevLetter = firstLetter;
    }

    $view.find('ul').html(items);
    $view.find('.navigation').html(letters);
    $view.find('.empty-note').prop('hidden', items.length > 0);
  }

  buildList($('#cocktails-view'), commitSetRecipes, 'recipe.html');
  buildList($('#menus-view'), commitSetMenus, 'menu.html');

  function showView(view) {
    $('#cocktails-view').prop('hidden', view !== 'cocktails');
    $('#menus-view').prop('hidden', view !== 'menus');
    $('.toggle-btn').each(function() {
      $(this).attr('aria-pressed', $(this).data('view') === view ? 'true' : 'false');
    });
    $('#mainTitle').text(view === 'menus' ? 'Menus' : 'Cocktails');
    $(document).prop('title', view === 'menus' ? 'Menus' : 'Cocktails');
  }

  $('.toggle-btn').click(function() {
    let view = $(this).data('view');
    showView(view);
    // keep the choice shareable and survive a refresh
    let url = view === 'menus' ? '?view=menus' : window.location.pathname;
    window.history.replaceState(null, '', url);
  });

  let requested = new URLSearchParams(window.location.search).get('view');
  showView(requested === 'menus' ? 'menus' : 'cocktails');
});
