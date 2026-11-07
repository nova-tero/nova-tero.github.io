(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.replace('no-svg', 'svg');
  if (CSS.supports('background-attachment', 'fixed') && !/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    root.classList.add('background-fixed');
  }
  const dataNode = document.getElementById('static-search-data');
  const data = dataNode ? JSON.parse(dataNode.textContent) : null;
  const navigation = document.querySelector('.navigation-top');
  const menu = document.getElementById('site-navigation');
  const toggle = menu?.querySelector('.menu-toggle');
  const customHeader = document.querySelector('.custom-header');
  const branding = document.querySelector('.site-branding');
  const image = document.getElementById('header-image');

  if (data?.headers?.length && image) {
    const selected = data.headers[Math.floor(Math.random() * data.headers.length)];
    image.src = selected.src;
    image.width = selected.width;
    image.height = selected.height;
  }

  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('toggled-on');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('focus', () => anchor.closest('li')?.classList.add('focus'));
    anchor.addEventListener('blur', () => anchor.closest('li')?.classList.remove('focus'));
  });

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const params = new URLSearchParams(location.search);
  if (data && params.has('s')) {
    const query = params.get('s') || '';
    const words = query.toLocaleLowerCase('de').trim().split(/\s+/).filter(Boolean);
    const matches = data.entries.filter((entry) => {
      const text = `${entry.title} ${entry.text}`.toLocaleLowerCase('de');
      return words.every((word) => text.includes(word));
    });
    const heading = matches.length
      ? data.labels.results.replace('%s', `<span>${escapeHTML(query)}</span>`)
      : escapeHTML(data.labels.none);
    const results = matches.length
      ? matches.map((entry) => entry.html).join('')
      : `<p>${escapeHTML(data.labels.notFound)}</p>${data.form}`;
    document.getElementById('content').innerHTML = `<div class="wrap"><header class="page-header"><h1 class="page-title">${heading}</h1></header><div id="primary" class="content-area"><main id="main" class="site-main">${results}</main></div></div>`;
    document.body.className = `search ${matches.length ? 'search-results' : 'search-no-results'} hfeed has-header-image colors-light`;
    const oldTitle = document.querySelector('.site-branding-text h1');
    if (oldTitle) {
      const title = document.createElement('p');
      title.className = oldTitle.className;
      title.innerHTML = oldTitle.innerHTML;
      oldTitle.replaceWith(title);
    }
    document.querySelector('.site-title a')?.removeAttribute('aria-current');
    document.querySelectorAll('.current-menu-item').forEach((item) => {
      item.classList.remove('current-menu-item');
      item.querySelector('a')?.removeAttribute('aria-current');
    });
    document.querySelectorAll('.menu-scroll-down').forEach((arrow) => arrow.remove());
    document.querySelectorAll('.search-field').forEach((field) => { field.value = query; });
    document.title = `${data.labels.results.replace('%s', query)} – ${document.querySelector('.site-title')?.textContent || ''}`;
  }

  function layoutNavigation() {
    if (!navigation || !toggle || !customHeader || !branding) return;
    const desktop = getComputedStyle(toggle).display === 'none';
    const height = navigation.getBoundingClientRect().height;
    const front = document.body.classList.contains('twentyseventeen-front-page');
    if (!desktop) {
      customHeader.style.marginBottom = '0px';
      branding.style.marginBottom = '0px';
      navigation.classList.remove('site-navigation-fixed');
      return;
    }
    if (front) {
      branding.style.marginBottom = `${height}px`;
      customHeader.style.marginBottom = '';
    } else {
      branding.style.marginBottom = '';
      customHeader.style.marginBottom = `${height}px`;
    }
    const wrap = navigation.querySelector('.wrap');
    const item = navigation.querySelector('.menu-item');
    const padding = wrap ? parseFloat(getComputedStyle(wrap).paddingTop) * 2 : 0;
    const itemHeight = item?.getBoundingClientRect().height || height;
    const offset = customHeader.clientHeight - (front ? height : 0);
    navigation.classList.toggle('site-navigation-fixed', height <= padding + itemHeight * 2 + 1 && window.scrollY >= offset);
  }
  document.querySelectorAll('.menu-scroll-down').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const primary = document.getElementById('primary');
      if (!primary) return;
      event.preventDefault();
      const height = navigation?.getBoundingClientRect().height || 0;
      window.scrollTo({top: primary.getBoundingClientRect().top + window.scrollY - height,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  });
  document.querySelectorAll('.site-content-contain a, .site-content-contain input, .site-content-contain button').forEach((element) => {
    element.addEventListener('focus', () => {
      if (!navigation?.classList.contains('site-navigation-fixed')) return;
      const height = navigation.getBoundingClientRect().height;
      if (element.getBoundingClientRect().top < height) {
        window.scrollBy(0, element.getBoundingClientRect().top - height - 50);
      }
    });
  });
  let scheduled = false;
  function scheduleLayout() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; layoutNavigation(); });
  }
  window.addEventListener('scroll', scheduleLayout, {passive: true});
  window.addEventListener('resize', scheduleLayout);
  window.addEventListener('load', layoutNavigation);
  document.fonts?.ready.then(layoutNavigation);
  layoutNavigation();
})();
