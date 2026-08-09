(function () {
  try {
    var redirect = sessionStorage.getItem('redirect');
    sessionStorage.removeItem('redirect');

    if (!redirect || redirect === location.href) return;

    var url = new URL(redirect);
    if (url.origin !== location.origin) return;

    history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch (_) {
    sessionStorage.removeItem('redirect');
  }
})();
