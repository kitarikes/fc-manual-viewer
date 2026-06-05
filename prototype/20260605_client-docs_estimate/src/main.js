(function () {
  window.AppData = {};
  window.AppUtils = {
    getParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    }
  };
})();
