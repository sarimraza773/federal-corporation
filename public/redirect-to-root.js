(function () {
  try {
    sessionStorage.setItem('redirect', location.href);
  } catch (_) {
    // Continue even when session storage is unavailable.
  }

  location.replace('/');
})();
