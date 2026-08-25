/* Pilavcı Cengo — minimal etkileşim katmanı */
(function () {
  "use strict";

  // JS aktif işareti (head'deki inline script zaten ekledi; idempotent)
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

  // ---- Açık/Kapalı rozeti (Europe/Istanbul saatine göre) ----
  // Saatler işletmenin Google kaydından; Pazar kapalı işletme teyitli.
  // Gün indeksleri: 0=Pazar ... 6=Cumartesi. [açılışDk, kapanışDk] ya da null.
  var SAATLER = [
    null,               // Pazar: kapalı
    [9 * 60, 23 * 60],  // Pazartesi 09:00–23:00
    [10 * 60, 23 * 60 + 30], // Salı 10:00–23:30
    [9 * 60, 23 * 60 + 30],  // Çarşamba
    [9 * 60, 23 * 60 + 30],  // Perşembe
    [9 * 60, 23 * 60 + 30],  // Cuma
    [9 * 60, 23 * 60 + 30]   // Cumartesi
  ];
  var GUN_ADI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  // Saat metni + Türkçe ek ("23:00'e kadar", "23:30'a kadar", "09:00'da açılır")
  function saatYaz(dk) {
    var h = Math.floor(dk / 60), m = dk % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function kadarEki(dk) { return dk % 60 === 0 ? "'e" : "'a"; } // 23:00'e / 23:30'a
  function durumRozetiBas() {
    var rozetler = document.querySelectorAll("[data-durum-rozet]");
    if (!rozetler.length) return;
    var simdi;
    try {
      var p = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var al = function (t) { var x = p.find(function (q) { return q.type === t; }); return x ? x.value : ""; };
      var kisa = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      simdi = { gun: kisa.indexOf(al("weekday")), dk: parseInt(al("hour"), 10) * 60 + parseInt(al("minute"), 10) };
      if (simdi.gun < 0 || isNaN(simdi.dk)) return;
    } catch (e) { return; }

    var bugun = SAATLER[simdi.gun];
    var metin, sinif;
    if (bugun && simdi.dk >= bugun[0] && simdi.dk < bugun[1]) {
      var kalan = bugun[1] - simdi.dk;
      sinif = "acik";
      metin = kalan <= 45
        ? "Yakında kapanıyor · " + saatYaz(bugun[1])
        : "Şu an açık · " + saatYaz(bugun[1]) + kadarEki(bugun[1]) + " kadar";
    } else {
      sinif = "kapali";
      // Sonraki açılışı bul (bugün henüz açılmadıysa bugün)
      var metinAcilis = "";
      if (bugun && simdi.dk < bugun[0]) {
        metinAcilis = "bugün " + saatYaz(bugun[0]) + "'da açılır";
      } else {
        for (var i = 1; i <= 7; i++) {
          var g = (simdi.gun + i) % 7;
          if (SAATLER[g]) {
            metinAcilis = (i === 1 ? "yarın" : GUN_ADI[g]) + " " + saatYaz(SAATLER[g][0]) + "'da açılır";
            break;
          }
        }
      }
      metin = "Şu an kapalı · " + metinAcilis;
    }
    rozetler.forEach(function (r) {
      r.textContent = metin;
      r.classList.add(sinif);
      r.hidden = false;
    });
  }
  durumRozetiBas();

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var ioTetiklendi = false;
  var io = new IntersectionObserver(
    function (entries) {
      ioTetiklendi = true;
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

  // Güvenlik ağı: IO HİÇ tetiklenmediyse (ör. arka planda render eden botlar)
  // içerik gizli kalmasın. IO çalışıyorsa scroll animasyonuna dokunma.
  window.setTimeout(function () {
    if (!ioTetiklendi) {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
      io.disconnect();
    }
  }, 3000);
})();
