/*
 * guard.js — لایه‌ی بازدارنده‌ی سمت مرورگر.
 *
 * خواسته‌ی کاربر: «راست‌کلیک کرد هیچی نیاد و منوی راست‌کلیک باز نشود».
 * این دقیقاً و به‌طور کامل انجام می‌شود.
 *
 * درباره‌ی devtools صادق باشیم: میان‌بُرهای F12 و Ctrl+Shift+I را می‌گیریم،
 * ولی هیچ صفحه‌ای نمی‌تواند منوی خود مرورگر را غیرفعال کند. این لایه جلوی
 * کنجکاویِ معمولی را می‌گیرد؛ سدِ واقعیِ دستکاری، مهرِ یکپارچگیِ SHA-256
 * در app.js و قوانین RLS سمت Supabase است.
 *
 * مهم: کنترل‌های خودِ بازی نباید قربانی شوند. برای همین انتخابِ متن فقط
 * روی عناصر تعاملی (input و [data-selectable]) باز می‌ماند.
 */
(() => {
  'use strict';

  /* عناصری که کاربر باید بتواند در آن‌ها متن انتخاب/تایپ کند */
  const interactive = (t) => t && (
    t.closest?.('input, textarea, [contenteditable="true"], [data-selectable]')
  );

  /*
   * ۱) منوی راست‌کلیک: کامل بسته. هم روی ماوس، هم لمسِ طولانی موبایل.
   *
   * چند لایه عمداً روی هم گذاشته شده‌اند:
   *   • window با capture → قبل از هر شنونده‌ی دیگری اجرا می‌شود.
   *   • document و body → اگر رویداد از مسیر دیگری بالا بیاید.
   *   • خاصیت oncontextmenu → آخرین سد، حتی اگر شنونده‌ها پاک شوند.
   * دلیل: روی canvasِ WebGL بعضی مرورگرها (از جمله Edge) منوی
   * «Save image as / Copy image» را نشان می‌دادند.
   */
  const kill = (e) => { e.preventDefault(); e.stopPropagation(); return false; };
  window.addEventListener('contextmenu', kill, { capture: true });
  document.addEventListener('contextmenu', kill, { capture: true });
  window.addEventListener('auxclick', (e) => { if (e.button === 2) kill(e); }, { capture: true });
  /* دکمه‌ی راست ماوس در همان لحظه‌ی فشرده شدن هم خنثی شود */
  window.addEventListener('pointerdown', (e) => {
    if (e.button === 2 && !interactive(e.target)) { e.preventDefault(); }
  }, { capture: true });

  const lockNode = (n) => { if (n) n.oncontextmenu = kill; };
  document.addEventListener('DOMContentLoaded', () => {
    lockNode(document.body);
    lockNode(document.documentElement);
    lockNode(document.getElementById('game-canvas'));
  }, { once: true });
  lockNode(document.documentElement);

  /* ۲) میان‌بُرهای بازکردن ابزار توسعه‌دهنده و مشاهده‌ی سورس. */
  window.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (
      e.key === 'F12' ||
      (ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||  // inspect / console
      (ctrl && ['u', 's'].includes(k))                              // view-source / save
    ) { e.preventDefault(); e.stopPropagation(); return false; }
  }, { capture: true });

  /* ۳) انتخاب متن و کشیدن تصویر — با استثنا برای فیلدهای ورودی. */
  window.addEventListener('selectstart', (e) => { if (!interactive(e.target)) e.preventDefault(); }, { capture: true });
  window.addEventListener('dragstart', (e) => { if (!interactive(e.target)) e.preventDefault(); }, { capture: true });

  /* ۴) لمسِ طولانی روی موبایل منوی «ذخیره‌ی تصویر» را می‌آورد. */
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent =
      'html{-webkit-touch-callout:none}' +
      'body{-webkit-user-select:none;-moz-user-select:none;user-select:none}' +
      'input,textarea,[contenteditable="true"],[data-selectable]{-webkit-user-select:text;user-select:text}';
    document.head.appendChild(s);
  }, { once: true });
})();
