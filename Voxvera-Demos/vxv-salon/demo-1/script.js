/* ==========================================================================
   Luxe Studio — script.js
   Vanilla JavaScript, no dependencies. Fictional demo website.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURATION: edit these values before publishing
     ------------------------------------------------------------------------ */
  const CONFIG = {
    businessName: 'Luxe Studio',

    // WhatsApp number: country code followed by the number, digits only
    // (no "+", spaces or dashes). While this is still the placeholder text
    // below, WhatsApp buttons show a reminder instead of opening a chat.
    whatsappNumber: 'YOUR_WHATSAPP_NUMBER_HERE',

    // Full maps URL for the "Get directions" link (for example a Google Maps
    // share link). While empty, the link shows a reminder instead.
    mapsUrl: ''
  };

  const whatsappReady = () => /^\d{8,15}$/.test(CONFIG.whatsappNumber);
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
     Header: shadow line on scroll, mobile menu, active link
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
      const desktop = window.matchMedia('(min-width: 900px)');
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
     Smooth in-page navigation (all "#section" links and booking CTAs)
     ------------------------------------------------------------------------ */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    // Links with data-service pre-select the booking form.
    applyPreselect(link);

    // Let dedicated handlers (WhatsApp / directions placeholders) take over.
    if (link.hasAttribute('data-whatsapp-link') && !whatsappReady()) return;
    if (link.hasAttribute('data-directions') && !mapsReady()) return;

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
     Missing image detection: no silent substitution
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
      console.warn('[Luxe Studio] Missing image file: ' + src);
    }
    renderAssetNotice();
  }

  $$('img').forEach((img) => {
    if (img.classList.contains('lightbox-img')) return;
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      flagMissing(img);
    } else {
      img.addEventListener('error', () => flagMissing(img));
    }
  });

  /* ------------------------------------------------------------------------
     Gallery lightbox
     ------------------------------------------------------------------------ */
  const lightbox = $('#lightbox');
  const galleryItems = $$('[data-gallery-item]');

  if (lightbox && galleryItems.length) {
    const lbImg = $('.lightbox-img', lightbox);
    const lbCaption = $('.lightbox-caption', lightbox);
    const lbCount = $('.lightbox-count', lightbox);
    const hasDialog = typeof lightbox.showModal === 'function';
    let current = 0;

    const showImage = (index) => {
      current = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[current];
      const thumb = $('img', item);
      const src = thumb.getAttribute('src');
      const caption = item.dataset.caption || thumb.alt;

      lbImg.hidden = false;
      lbImg.onload = () => { lbImg.hidden = false; };
      lbImg.onerror = () => {
        lbImg.hidden = true;
        lbCaption.textContent = 'Missing file: ' + src;
      };
      lbImg.alt = thumb.alt;
      lbImg.src = src;
      lbCaption.textContent = caption;
      lbCount.textContent = (current + 1) + ' / ' + galleryItems.length;
    };

    const openLightbox = (index) => {
      showImage(index);
      if (hasDialog) {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
      document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
      if (hasDialog) {
        if (lightbox.open) lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
      document.body.classList.remove('no-scroll');
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    $('.lightbox-close', lightbox).addEventListener('click', closeLightbox);
    $('.lightbox-prev', lightbox).addEventListener('click', () => showImage(current - 1));
    $('.lightbox-next', lightbox).addEventListener('click', () => showImage(current + 1));

    lightbox.addEventListener('close', () => document.body.classList.remove('no-scroll'));

    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') showImage(current + 1);
      else if (event.key === 'ArrowLeft') showImage(current - 1);
      else if (event.key === 'Escape' && !hasDialog) closeLightbox();
    });

    // Click on the dark area (outside the image) closes the viewer.
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) closeLightbox();
    });

    // Swipe left/right on touch screens.
    let touchStartX = null;
    lightbox.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) > 50) showImage(current + (deltaX < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Booking form
     ------------------------------------------------------------------------ */
  const form = $('#booking-form');
  const successPanel = $('#form-success');
  const statusEl = $('#form-status');
  const serviceSelect = $('#service');
  const treatmentInput = $('#treatment');
  const dateInput = $('#date');
  let lastRequest = null;

  const pad = (n) => String(n).padStart(2, '0');
  if (dateInput) {
    const now = new Date();
    dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  const fieldDefs = [
    {
      id: 'name',
      check: (value) => value.trim().length >= 2 ? '' : 'Please enter your full name.'
    },
    {
      id: 'phone',
      check: (value) => {
        const text = value.trim();
        if (!text) return 'Please enter a phone number so we can confirm your visit.';
        const digits = text.replace(/\D/g, '');
        if (!/^[+\d\s().-]+$/.test(text) || digits.length < 7 || digits.length > 15) {
          return 'Please enter a valid phone number (7 to 15 digits).';
        }
        return '';
      }
    },
    {
      id: 'email',
      check: (value) => {
        const text = value.trim();
        if (!text) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? '' : 'Please enter a valid email address, or leave this blank.';
      }
    },
    {
      id: 'service',
      check: (value) => value ? '' : 'Please choose a service.'
    },
    {
      id: 'date',
      check: (value) => {
        if (!value) return 'Please choose a preferred date.';
        const picked = new Date(value + 'T00:00:00');
        if (Number.isNaN(picked.getTime())) return 'Please choose a valid date.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return picked < today ? 'Please choose today or a future date.' : '';
      }
    },
    {
      id: 'time',
      check: (value) => value ? '' : 'Please choose a preferred time.'
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

  function collectRequest() {
    const serviceOption = serviceSelect.options[serviceSelect.selectedIndex];
    const dateValue = dateInput.value;
    const dateLabel = new Date(dateValue + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    return {
      name: $('#name').value.trim(),
      phone: $('#phone').value.trim(),
      email: $('#email').value.trim(),
      service: serviceOption ? serviceOption.textContent : '',
      treatment: treatmentInput.value.trim(),
      date: dateLabel,
      time: $('#time').value,
      notes: $('#notes').value.trim()
    };
  }

  function buildWhatsAppMessage(data) {
    const lines = [
      'Hello ' + CONFIG.businessName + ', I would like to book an appointment.',
      '',
      'Name: ' + data.name,
      'Phone: ' + data.phone,
      'Service: ' + data.service
    ];
    if (data.treatment) lines.push('Treatment: ' + data.treatment);
    lines.push('Preferred date: ' + data.date, 'Preferred time: ' + data.time);
    if (data.notes) lines.push('Notes: ' + data.notes);
    return lines.join('\n');
  }

  function openWhatsApp(message) {
    if (!whatsappReady()) {
      showToast('WhatsApp number not set yet. Add it to CONFIG.whatsappNumber in script.js (country code + digits).');
      return;
    }
    const url = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
  }

  function showSuccess(data) {
    $('#success-name').textContent = data.name.split(/\s+/)[0];

    const summary = $('#success-summary');
    summary.textContent = '';
    const rows = [
      ['Service', data.service],
      ['Treatment', data.treatment],
      ['Date', data.date],
      ['Time', data.time],
      ['Phone', data.phone],
      ['Email', data.email]
    ];
    rows.forEach(([label, value]) => {
      if (!value) return;
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
    const booking = document.getElementById('booking');
    if (booking) booking.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function resetBooking() {
    form.reset();
    fieldDefs.forEach((def) => setFieldError(def.id, ''));
    setStatus('', false);
    successPanel.hidden = true;
    form.hidden = false;
    lastRequest = null;
  }

  function applyPreselect(link) {
    const service = link.dataset ? link.dataset.service : '';
    if (!service || !form) return;
    if (!successPanel.hidden) resetBooking();
    serviceSelect.value = service;
    setFieldError('service', '');
    treatmentInput.value = link.dataset.treatment || '';
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

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateAll()) return;
      lastRequest = collectRequest();
      showSuccess(lastRequest);
    });

    $('#form-whatsapp').addEventListener('click', () => {
      if (!validateAll()) return;
      openWhatsApp(buildWhatsAppMessage(collectRequest()));
    });

    $('#success-whatsapp').addEventListener('click', () => {
      if (lastRequest) openWhatsApp(buildWhatsAppMessage(lastRequest));
    });

    $('#book-another').addEventListener('click', () => {
      resetBooking();
      $('#name').focus();
    });
  }

  /* ------------------------------------------------------------------------
     Contact column: WhatsApp link and directions link
     ------------------------------------------------------------------------ */
  $$('[data-whatsapp-link]').forEach((link) => {
    if (whatsappReady()) {
      const hello = 'Hello ' + CONFIG.businessName + ', I would like to book an appointment.';
      link.href = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(hello);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openWhatsApp('');
      });
    }
  });

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