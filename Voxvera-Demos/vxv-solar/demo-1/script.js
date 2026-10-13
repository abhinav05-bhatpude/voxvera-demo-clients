/* ==========================================================================
   SOLVANTA ENERGY — script.js
   Vanilla JavaScript, no dependencies. Fictional demo website.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURATION: edit these values when customising for a real business
     ------------------------------------------------------------------------ */
  const CONFIG = {
    // Enquiry form endpoint. Leave empty to run the form in demo mode, where
    // nothing is sent anywhere. To go live, set this to a real form service
    // or backend URL that accepts a JSON POST (for example a Formspree,
    // Getform or your own API endpoint). It must start with https://
    formEndpoint: '',

    // Full maps URL for the "Get directions" link (for example a Google Maps
    // share link). While empty, the link shows a reminder instead.
    mapsUrl: ''
  };

  const endpointReady = () => /^https:\/\//i.test(CONFIG.formEndpoint);
  const mapsReady = () => /^https?:\/\//i.test(CONFIG.mapsUrl);

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const toastEl = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 6000);
  }

  /* ------------------------------------------------------------------------
     Header: border on scroll, mobile menu, active link
     ------------------------------------------------------------------------ */
  const header = $('.site-header');
  const nav = $('#primary-nav');
  const navToggle = $('.nav-toggle');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }
  const menuIsOpen = () => Boolean(nav && nav.classList.contains('is-open'));

  if (nav && navToggle) {
    navToggle.addEventListener('click', () => setMenu(!menuIsOpen()));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuIsOpen()) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (menuIsOpen() && header && !header.contains(event.target)) setMenu(false);
    });

    // Reset the menu if the viewport grows to desktop width.
    if (window.matchMedia) {
      const desktop = window.matchMedia('(min-width: 1020px)');
      const reset = () => { if (desktop.matches) setMenu(false); };
      if (desktop.addEventListener) desktop.addEventListener('change', reset);
      else if (desktop.addListener) desktop.addListener(reset);
    }
  }

  // Highlight the nav link for the section currently in view.
  const navLinks = $$('.primary-nav li a[href^="#"]');
  const spiedSections = navLinks
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && spiedSections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spiedSections.forEach((section) => spy.observe(section));
  }

  /* ------------------------------------------------------------------------
     Smooth in-page navigation (nav, quote CTAs, footer links)
     ------------------------------------------------------------------------ */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    // The "Get directions" link is handled separately when no URL is set.
    if (link.hasAttribute('data-directions') && !mapsReady()) return;

    // Links with data-project-type pre-select the project type in the form.
    applyPreselect(link);

    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + id);
    }
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */
  const revealEls = $$('.reveal');
  revealEls.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty('--delay', el.dataset.delay + 'ms');
  });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     Missing image detection: identify the file, never substitute another
     ------------------------------------------------------------------------ */
  const missingImages = new Set();
  let assetNotice = null;

  function renderAssetNotice() {
    if (!missingImages.size) return;
    if (!assetNotice) {
      assetNotice = document.createElement('aside');
      assetNotice.className = 'asset-notice';
      assetNotice.setAttribute('role', 'alert');
      document.body.appendChild(assetNotice);
    }
    assetNotice.hidden = false;
    assetNotice.textContent = '';

    const title = document.createElement('strong');
    title.textContent = 'Missing image files';
    const intro = document.createElement('span');
    intro.textContent = 'Add these files to the assets/ folder (names are case-sensitive):';
    const list = document.createElement('ul');
    Array.from(missingImages).sort().forEach((src) => {
      const item = document.createElement('li');
      item.textContent = src;
      list.appendChild(item);
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss missing files notice');
    close.innerHTML = '&times;';
    close.addEventListener('click', () => { assetNotice.hidden = true; });

    assetNotice.append(title, intro, list, close);
  }

  function flagMissing(img) {
    const src = img.getAttribute('src');
    const wrapper = img.closest('.media');
    if (wrapper) {
      wrapper.classList.add('is-missing');
      wrapper.setAttribute('data-missing', src);
    }
    if (!missingImages.has(src)) {
      missingImages.add(src);
      console.warn('[SOLVANTA ENERGY] Missing image file: ' + src);
    }
    renderAssetNotice();
  }

  $$('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      flagMissing(img);
    } else {
      img.addEventListener('error', () => flagMissing(img));
    }
  });

  /* ------------------------------------------------------------------------
     Projects showcase: accessible tabs
     ------------------------------------------------------------------------ */
  const tabs = $$('.tablist [role="tab"]');
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  if (tabs.length && panels.every(Boolean)) {
    const selectTab = (index, moveFocus) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (moveFocus) tabs[index].focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(index, false));
      tab.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        selectTab(next, true);
      });
    });

    selectTab(0, false);
  }

  /* ------------------------------------------------------------------------
     Enquiry form
     ------------------------------------------------------------------------ */
  const form = $('#enquiry-form');
  const successPanel = $('#form-success');
  const statusEl = $('#form-status');
  const submitBtn = $('#submit-btn');
  const projectSelect = $('#project-type');
  const modeNote = $('#form-mode-note');
  let sending = false;

  if (modeNote && endpointReady()) {
    modeNote.textContent = 'Share a few details and our team will respond.';
  }

  const fieldDefs = [
    {
      id: 'name',
      check: (value) => value.trim().length >= 2 ? '' : 'Please enter your name.'
    },
    {
      id: 'company',
      check: (value) => value.trim().length >= 2 ? '' : 'Please enter your company name.'
    },
    {
      id: 'contact-method',
      check: (value) => {
        const text = value.trim();
        if (!text) return 'Please enter a phone number or an email address.';
        if (text.includes('@')) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? '' : 'That email address does not look right. Please check it.';
        }
        const digits = text.replace(/\D/g, '');
        if (!/^[+\d\s().-]+$/.test(text) || digits.length < 7 || digits.length > 15) {
          return 'Please enter a valid phone number (7 to 15 digits) or an email address.';
        }
        return '';
      }
    },
    {
      id: 'project-type',
      check: (value) => value ? '' : 'Please choose a project type.'
    },
    {
      id: 'message',
      check: (value) => value.trim().length >= 10 ? '' : 'Please add a short message (at least 10 characters).'
    }
  ];

  function setFieldError(id, message) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + '-error');
    if (!input || !error) return;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
  }

  function validateField(def) {
    const input = document.getElementById(def.id);
    const message = def.check(input.value);
    setFieldError(def.id, message);
    return !message;
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', Boolean(isError));
  }

  function validateAll() {
    let firstInvalid = null;
    let count = 0;
    fieldDefs.forEach((def) => {
      if (!validateField(def)) {
        count += 1;
        if (!firstInvalid) firstInvalid = document.getElementById(def.id);
      }
    });
    if (count) {
      setStatus('Please check ' + count + ' highlighted ' + (count === 1 ? 'field' : 'fields') + ' and try again.', true);
      firstInvalid.focus();
      return false;
    }
    setStatus('', false);
    return true;
  }

  function collectEnquiry() {
    const option = projectSelect.options[projectSelect.selectedIndex];
    return {
      name: $('#name').value.trim(),
      company: $('#company').value.trim(),
      contact: $('#contact-method').value.trim(),
      projectType: projectSelect.value,
      projectTypeLabel: option ? option.textContent : '',
      message: $('#message').value.trim()
    };
  }

  function showSuccess(data, demoMode) {
    $('#success-name').textContent = data.name.split(/\s+/)[0];
    $('#success-eyebrow').textContent = demoMode ? 'Demo confirmation' : 'Enquiry received';
    $('#success-text').textContent = demoMode
      ? 'This is a demonstration form, so nothing has been sent to any company. On a live site, this is where the enquiry would reach the sales team.'
      : 'We have received your enquiry and will be in touch using the details you gave.';

    const summary = $('#success-summary');
    summary.textContent = '';
    [
      ['Company', data.company],
      ['Contact', data.contact],
      ['Project type', data.projectTypeLabel]
    ].forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'summary-row';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      row.append(dt, dd);
      summary.appendChild(row);
    });

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus({ preventScroll: true });
    successPanel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function resetForm() {
    form.reset();
    fieldDefs.forEach((def) => setFieldError(def.id, ''));
    setStatus('', false);
    successPanel.hidden = true;
    form.hidden = false;
  }

  function applyPreselect(link) {
    const type = link.dataset ? link.dataset.projectType : '';
    if (!type || !form) return;
    if (!successPanel.hidden) resetForm();
    projectSelect.value = type;
    setFieldError('project-type', '');
  }

  async function submitEnquiry(data) {
    const response = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        company: data.company,
        contact: data.contact,
        projectType: data.projectTypeLabel,
        message: data.message
      })
    });
    if (!response.ok) throw new Error('Request failed with status ' + response.status);
  }

  if (form) {
    fieldDefs.forEach((def) => {
      const input = document.getElementById(def.id);
      input.addEventListener('blur', () => validateField(def));
      const revalidate = () => {
        if (input.getAttribute('aria-invalid') === 'true') validateField(def);
      };
      input.addEventListener('input', revalidate);
      input.addEventListener('change', revalidate);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending || !validateAll()) return;

      const data = collectEnquiry();

      if (!endpointReady()) {
        showSuccess(data, true);
        return;
      }

      sending = true;
      submitBtn.disabled = true;
      setStatus('Sending your enquiry...', false);
      try {
        await submitEnquiry(data);
        setStatus('', false);
        showSuccess(data, false);
      } catch (error) {
        setStatus('Sorry, we could not send your enquiry. Please try again, or use the contact details below.', true);
      } finally {
        sending = false;
        submitBtn.disabled = false;
      }
    });

    $('#new-enquiry').addEventListener('click', () => {
      resetForm();
      $('#name').focus();
    });
  }

  /* ------------------------------------------------------------------------
     Contact: directions link
     ------------------------------------------------------------------------ */
  $$('[data-directions]').forEach((link) => {
    if (mapsReady()) {
      link.href = CONFIG.mapsUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('Directions link not set yet. Add your maps URL to CONFIG.mapsUrl in script.js.');
      });
    }
  });

  /* ------------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------------ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();