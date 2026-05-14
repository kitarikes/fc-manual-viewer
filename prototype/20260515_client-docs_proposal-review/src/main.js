(function () {
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  window.AppUtils = { getParam, escHtml };
})();
