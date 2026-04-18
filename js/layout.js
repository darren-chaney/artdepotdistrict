// Art Depot District — Shared Layout
// Nav and footer injected on every page

const NAV_HTML = `
<nav class="nav" id="mainNav">
  <div class="nav-inner">
    <a href="/index.html" class="nav-logo-wrap">
      <span class="nav-logo">Art Depot District</span>
      <span class="nav-logo-sub">Explore &bull; Create &bull; Discover</span>
    </a>
    <ul class="nav-links">
      <li><a href="/index.html">Home</a></li>
      <li><a href="/businesses.html">Businesses</a></li>
      <li><a href="/events.html">Events</a></li>
      <li><a href="/depot-days.html">Depot Days</a></li>
      <li><a href="/car-show.html" class="nav-highlight">Car Show</a></li>
    </ul>
    <div class="nav-social">
      <a href="#" id="navFacebook" aria-label="Facebook" target="_blank">f</a>
      <a href="#" id="navInstagram" aria-label="Instagram" target="_blank">in</a>
      <a href="/contact.html" aria-label="Contact">&#x2709;</a>
    </div>
    <button class="nav-hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav-mobile" id="mobileMenu">
  <ul>
    <li><a href="/index.html">Home</a></li>
    <li><a href="/businesses.html">Businesses</a></li>
    <li><a href="/events.html">Events</a></li>
    <li><a href="/depot-days.html">Depot Days</a></li>
    <li><a href="/car-show.html">Car Show Registration</a></li>
    <li><a href="/visit.html">Visit &amp; Directions</a></li>
    <li><a href="/about.html">About the District</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
</div>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-brand-logo">Art Depot District</div>
        <div class="footer-brand-sub" id="footerTagline">Explore &bull; Create &bull; Discover</div>
        <p id="footerDesc">A destination for art, community, food, and culture in the heart of Covington, Tennessee.</p>
        <div id="footerContactInfo" style="margin-top:12px;display:flex;flex-direction:column;gap:6px"></div>
        <div class="footer-social">
          <a href="#" id="footerFacebook" target="_blank" aria-label="Facebook">F</a>
          <a href="#" id="footerInstagram" target="_blank" aria-label="Instagram">IG</a>
        </div>
        <p style="margin-top:14px;font-size:.74rem;color:rgba(255,255,255,.28)">Powered by DistilCore</p>
      </div>
      <div class="footer-col">
        <h5>Explore</h5>
        <ul class="footer-links">
          <li><a href="/businesses.html">District Businesses</a></li>
          <li><a href="/events.html">Events Calendar</a></li>
          <li><a href="/depot-days.html">Depot Days Festival</a></li>
          <li><a href="/car-show.html">Car Show</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>District</h5>
        <ul class="footer-links">
          <li><a href="/about.html">About</a></li>
          <li><a href="/visit.html">Visit &amp; Directions</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p id="footerCopyright">&copy; ${new Date().getFullYear()} Art Depot District &mdash; Covington, Tennessee</p>
      <div class="footer-bottom-links">
        <a href="/contact.html">Contact</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>`;


// ── Google Analytics ──────────────────────────────────────
(function() {
  const GA_ID = 'G-K5RXTL5BVC';
  const script = document.createElement('script');
  script.async = true;
  script.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
})();

function injectLayout() {
  const navEl    = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');
  if (navEl)    navEl.innerHTML    = NAV_HTML;
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  // Hamburger
  document.addEventListener('click', e => {
    const btn  = e.target.closest('#hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    if (btn) menu.classList.toggle('open');
    else if (!e.target.closest('.nav-mobile')) menu.classList.remove('open');
  });

  // Active link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '/' && href === '/index.html')) {
      a.classList.add('active');
    }
  });

  // Inject social links and footer content from site config if available
  if (window.__ART_DEPOT_DB) {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(({ doc, getDoc }) => {
      getDoc(doc(window.__ART_DEPOT_DB, 'site_config', 'main')).then(snap => {
        if (!snap.exists()) return;
        const cfg = snap.data();
        if (cfg.socials?.facebook)  { document.querySelectorAll('#navFacebook,#footerFacebook').forEach(a => a.href = cfg.socials.facebook); }
        if (cfg.socials?.instagram) { document.querySelectorAll('#navInstagram,#footerInstagram').forEach(a => a.href = cfg.socials.instagram); }
        if (cfg.footerTagline) {
          const el = document.getElementById('footerTagline');
          if (el) el.textContent = cfg.footerTagline;
        }
        if (cfg.footerDesc) {
          const el = document.getElementById('footerDesc');
          if (el) el.textContent = cfg.footerDesc;
        }
        if (cfg.footerCopyright) {
          const el = document.getElementById('footerCopyright');
          if (el) el.textContent = `© ${new Date().getFullYear()} ${cfg.footerCopyright}`;
        }
        // Footer contact info
        const contactInfo = document.getElementById('footerContactInfo');
        if (contactInfo) {
          const lines = [];
          if (cfg.address) lines.push(`<span style="font-size:.8rem;color:rgba(255,255,255,.55)">${cfg.address.split('\n')[0]}</span>`);
          if (cfg.phone)   lines.push(`<a href="tel:${cfg.phone}" style="font-size:.8rem;color:rgba(255,255,255,.55);text-decoration:none">${cfg.phone}</a>`);
          if (cfg.contactEmail) {
            const p = cfg.contactEmail.split('@');
            lines.push(`<a data-email="${p[0]}|${p[1]}" style="font-size:.8rem;color:rgba(255,255,255,.55);text-decoration:none;cursor:pointer">${p[0]}\u0040${p[1]}</a>`);
          }
          contactInfo.innerHTML = lines.join('');
          // Wire obfuscated email clicks
          contactInfo.querySelectorAll('[data-email]').forEach(a => {
            a.addEventListener('click', () => {
              const parts = a.dataset.email.split('|');
              window.location.href = 'mailto:' + parts[0] + '@' + parts[1];
            });
          });
        }
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectLayout);
} else {
  injectLayout();
}
