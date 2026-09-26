(function () {
  try {
    var t = localStorage.getItem("spocoi-theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
