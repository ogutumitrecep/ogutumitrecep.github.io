/* Pilavcı Cengo — minimal etkileşim katmanı */
(function () {
  "use strict";

  // JS aktif: reveal gizlemeleri ancak bu class ile devreye girer
  document.documentElement.classList.add("js");

  // Footer yılı
  var yil = document.getElementById("yil");
  if (yil) yil.textContent = String(new Date().getFullYear());

  // Header gölgesi
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealEls.forEach(function (el) { io.observe(el); });

  // Güvenlik ağı: IntersectionObserver herhangi bir nedenle tetiklenmezse
  // (ör. arka planda render eden botlar) içerik asla gizli kalmasın
  window.setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }, 3000);
})();
