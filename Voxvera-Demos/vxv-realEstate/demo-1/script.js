/* ==========================================================================
   UrbanKey Properties — script.js
   Vanilla JavaScript, no dependencies. Fictional demo website.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURATION: edit these values when customising for a real business
     ------------------------------------------------------------------------ */
  const CONFIG = {
    businessName: 'UrbanKey Properties',

    // WhatsApp number: country code followed by the number, digits only
    // (no "+", spaces or dashes). While this is still the placeholder text
    // below, WhatsApp buttons show a reminder instead of opening a chat.
    whatsappNumber: 'YOUR_WHATSAPP_NUMBER_HERE',

    // Enquiry form endpoint. Leave empty to run the form in demo mode, where
    // nothing is sent anywhere. To go live, set this to a real form service
    // or backend URL that accepts a JSON POST. It must start with https://
    formEndpoint: '',

    // Social profile URLs. While a value is empty, that link shows a
    // reminder instead of navigating anywhere.
    social: {
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  };

  const whatsappReady = () => /^\d{8,15}$/.test(CONFIG.whatsappNumber);
  const endpointReady = () => /^https:\/\//i.test(CONFIG.formEndpoint);
  const urlReady = (url) => /^https?:\/\//i.test(url || '');

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

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
      const desktop = window.matchMedia('(min-width: 1080px)');
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
    if (!src) return;
    const wrapper = img.closest('.media');
    if (wrapper) {
      wrapper.classList.add('is-missing');
      wrapper.setAttribute('data-missing', src);
    }
    if (!missingImages.has(src)) {
      missingImages.add(src);
      console.warn('[UrbanKey Properties] Missing image file: ' + src);
    }
    renderAssetNotice();
  }

  function watchImage(img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      flagMissing(img);
    } else {
      img.addEventListener('error', () => flagMissing(img));
    }
  }
  $$('img').forEach(watchImage);

  /* ------------------------------------------------------------------------
     Property search and filtering
     ------------------------------------------------------------------------ */
  const listings = $$('.listing');
  const searchForm = $('#search-form');
  const typeSelect = $('#search-type');
  const locationSelect = $('#search-location');
  const budgetSelect = $('#search-budget');
  const chips = $$('.chip');
  const resultsCount = $('#results-count');
  const noResults = $('#no-results');
  const filters = { type: '', location: '', budget: '' };

  function inBudget(price, range) {
    if (!range) return true;
    const parts = range.split('-');
    const low = Number(parts[0]) || 0;
    const high = parts[1] === '' || parts[1] === undefined ? Infinity : Number(parts[1]);
    return price >= low && price < high;
  }

  function filtersActive() {
    return Boolean(filters.type || filters.location || filters.budget);
  }

  function applyFilters() {
    let shown = 0;
    listings.forEach((listing) => {
      const match =
        (!filters.type || listing.dataset.type === filters.type) &&
        (!filters.location || listing.dataset.location === filters.location) &&
        inBudget(Number(listing.dataset.price), filters.budget);
      listing.hidden = !match;
      if (match) shown += 1;
    });

    // Keep every control in step with the current filters.
    if (typeSelect) typeSelect.value = filters.type;
    if (locationSelect) locationSelect.value = filters.location;
    if (budgetSelect) budgetSelect.value = filters.budget;
    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.type === filters.type));
    });

    if (resultsCount) {
      resultsCount.textContent = '';
      const text = document.createElement('span');
      text.textContent = 'Showing ' + shown + ' of ' + listings.length + ' illustrative sample listings.';
      resultsCount.appendChild(text);
      if (filtersActive()) {
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.textContent = 'Clear filters';
        clear.addEventListener('click', clearFilters);
        resultsCount.appendChild(clear);
      }
    }
    if (noResults) noResults.hidden = shown !== 0;
  }

  function clearFilters() {
    filters.type = '';
    filters.location = '';
    filters.budget = '';
    applyFilters();
  }

  function readSearchForm() {
    filters.type = typeSelect.value;
    filters.location = locationSelect.value;
    filters.budget = budgetSelect.value;
  }

  // Category counts in the Property Types section.
  $$('[data-count-type]').forEach((el) => {
    const count = listings.filter((l) => l.dataset.type === el.dataset.countType).length;
    el.textContent = String(count);
  });

  if (listings.length) {
    if (searchForm) {
      searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        readSearchForm();
        applyFilters();
        goTo('properties');
      });
      $('#search-reset').addEventListener('click', clearFilters);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filters.type = chip.dataset.type;
        applyFilters();
      });
    });

    const clearBtn = $('#clear-filters');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);

    applyFilters();
  }

  /* ------------------------------------------------------------------------
     Smooth in-page navigation (nav, CTAs, categories, footer links)
     ------------------------------------------------------------------------ */
  function goTo(id, updateHash = true) {
    const target = document.getElementById(id);
    if (!target) return;
    setMenu(false);
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    if (updateHash && window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + id);
    }
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;

    // The WhatsApp link opens a chat when configured; otherwise a reminder.
    if (link.hasAttribute('data-whatsapp-link') || link.hasAttribute('data-social')) return;

    // Category links filter the listings.
    if (link.dataset.category !== undefined) {
      filters.type = link.dataset.category;
      filters.location = '';
      filters.budget = '';
      applyFilters();
    }

    // "Enquire Now" links pre-select the property in the enquiry form.
    if (link.dataset.listing) preselectProperty(link.dataset.listing);

    event.preventDefault();
    goTo(id);
  });

  /* ------------------------------------------------------------------------
     Property details modal
     ------------------------------------------------------------------------ */
  const modal = $('#detail-modal');
  let modalOpener = null;
  let activeListing = null;

  function listingById(id) {
    return listings.find((l) => l.dataset.id === id) || null;
  }

  function addFact(list, label, value) {
    if (!value) return;
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    row.append(dt, dd);
    list.appendChild(row);
  }

  function fillModal(listing) {
    const cardImg = $('.listing-media img', listing);
    const modalImg = $('#modal-img');
    const modalMedia = modalImg.closest('.media');
    modalMedia.classList.remove('is-missing');
    modalMedia.removeAttribute('data-missing');
    modalImg.src = cardImg.getAttribute('src');
    modalImg.alt = cardImg.alt;
    watchImage(modalImg);

    const typeLabel = $('.tag', listing).textContent;
    $('#modal-type').textContent = typeLabel;
    $('#modal-title').textContent = $('h3', listing).textContent;
    $('#modal-loc').textContent = listing.dataset.location + ' (sample location)';
    $('#modal-price').textContent = $('.price', listing).textContent.trim();

    const details = $('.listing-details', listing);
    $('#modal-desc').textContent = $('.d-desc', details).textContent;

    const facts = $('#modal-facts');
    facts.textContent = '';
    addFact(facts, 'Property type', typeLabel);
    addFact(facts, 'Location', listing.dataset.location + ' (sample)');
    addFact(facts, 'Illustrative price', $('.price', listing).textContent.trim());
    addFact(facts, 'Area', listing.dataset.area ? listing.dataset.area + ' (illustrative)' : '');
    addFact(facts, 'Bedrooms', listing.dataset.beds);
    addFact(facts, 'Bathrooms', listing.dataset.baths);

    const amenities = $('#modal-amenities');
    amenities.textContent = '';
    $$('.d-amenities li', details).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.textContent;
      amenities.appendChild(li);
    });

    const enquire = $('#modal-enquire');
    enquire.dataset.listing = listing.dataset.id;
    enquire.setAttribute('aria-label', 'Enquire now: ' + $('h3', listing).textContent);
  }

  function openModal(listing, opener) {
    if (!modal) return;
    activeListing = listing;
    modalOpener = opener || null;
    fillModal(listing);
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    modal.scrollTop = 0;
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
    } else {
      modal.removeAttribute('open');
      afterModalClose();
    }
  }

  function afterModalClose() {
    document.body.classList.remove('no-scroll');
    if (modalOpener && document.contains(modalOpener)) modalOpener.focus();
    modalOpener = null;
  }

  if (modal) {
    $$('[data-details]').forEach((button) => {
      button.addEventListener('click', () => {
        const listing = listingById(button.dataset.details);
        if (listing) openModal(listing, button);
      });
    });

    $('.modal-close', modal).addEventListener('click', closeModal);
    modal.addEventListener('close', afterModalClose);

    // Clicking the dark backdrop (outside the dialog box) closes the modal.
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    // Fallback for browsers without <dialog>: Escape key.
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && typeof modal.showModal !== 'function') closeModal();
    });

    $('#modal-enquire').addEventListener('click', (event) => {
      event.preventDefault();
      const id = event.currentTarget.dataset.listing;
      modalOpener = null;
      closeModal();
      if (id) preselectProperty(id);
      goTo('enquiry');
    });

    $('#modal-whatsapp').addEventListener('click', () => {
      if (!activeListing) return;
      const name = $('h3', activeListing).textContent;
      openWhatsApp('Hello ' + CONFIG.businessName + ', I would like to enquire about ' +
        name + ' (' + activeListing.dataset.location + ').');
    });
  }

  /* ------------------------------------------------------------------------
     Enquiry form
     ------------------------------------------------------------------------ */
  const form = $('#enquiry-form');
  const successPanel = $('#form-success');
  const statusEl = $('#form-status');
  const submitBtn = $('#submit-btn');
  const propertySelect = $('#property');
  const enquiryTypeSelect = $('#enquiry-type');
  const modeNote = $('#form-mode-note');
  let sending = false;

  if (modeNote && endpointReady()) {
    modeNote.textContent = 'Share a few details and we will get back to you.';
  }

  const fieldDefs = [
    {
      id: 'full-name',
      check: (value) => value.trim().length >= 2 ? '' : 'Please enter your full name.'
    },
    {
      id: 'phone',
      check: (value) => {
        const text = value.trim();
        if (!text) return 'Please enter your phone number.';
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
        if (!text) return 'Please enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? '' : 'Please enter a valid email address.';
      }
    },
    {
      id: 'enquiry-type',
      check: (value) => value ? '' : 'Please choose an enquiry type.'
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

  function preselectProperty(id) {
    if (!form || !propertySelect) return;
    if (successPanel && !successPanel.hidden) resetForm();
    propertySelect.value = id;
    const listing = listingById(id);
    if (listing && listing.dataset.enq && !enquiryTypeSelect.value) {
      enquiryTypeSelect.value = listing.dataset.enq === 'commercial' ? 'Commercial' : 'Buying';
      setFieldError('enquiry-type', '');
    }
  }

  function collectEnquiry() {
    const propOption = propertySelect.options[propertySelect.selectedIndex];
    return {
      fullName: $('#full-name').value.trim(),
      phone: $('#phone').value.trim(),
      email: $('#email').value.trim(),
      property: propertySelect.value ? propOption.textContent : '',
      enquiryType: enquiryTypeSelect.value,
      message: $('#message').value.trim()
    };
  }

  function showSuccess(data, demoMode) {
    $('#success-name').textContent = data.fullName.split(/\s+/)[0];
    $('#success-eyebrow').textContent = demoMode ? 'Demo confirmation' : 'Enquiry received';
    $('#success-text').textContent = demoMode
      ? 'This is a front-end demonstration, so your enquiry has not been transmitted to anyone. On a live site, this is where it would reach the property team.'
      : 'We have received your enquiry and will be in touch using the details you gave.';

    const summary = $('#success-summary');
    summary.textContent = '';
    [
      ['Enquiry type', data.enquiryType],
      ['Property', data.property || 'No specific property'],
      ['Phone', data.phone],
      ['Email', data.email]
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
    successPanel.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  }

  function resetForm() {
    form.reset();
    fieldDefs.forEach((def) => setFieldError(def.id, ''));
    setStatus('', false);
    successPanel.hidden = true;
    form.hidden = false;
  }

  async function submitEnquiry(data) {
    const response = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Request failed with status ' + response.status);
  }

  if (form) {
    fieldDefs.forEach((def) => {
      const input = document.getElementById(def.id);
      // Validate on blur only once the field has content (or already shows an
      // error), so tabbing or clicking past an untouched field stays quiet.
      input.addEventListener('blur', () => {
        if (input.value.trim() === '' && input.getAttribute('aria-invalid') !== 'true') return;
        validateField(def);
      });
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
      $('#full-name').focus();
    });
  }

  /* ------------------------------------------------------------------------
     WhatsApp and social links
     ------------------------------------------------------------------------ */
  function openWhatsApp(message) {
    if (!whatsappReady()) {
      showToast('WhatsApp number not set yet. Add it to CONFIG.whatsappNumber in script.js (country code + digits).');
      return;
    }
    const url = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
  }

  $$('[data-whatsapp-link]').forEach((link) => {
    if (whatsappReady()) {
      const hello = 'Hello ' + CONFIG.businessName + ', I would like to enquire about a property.';
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

  $$('[data-social]').forEach((link) => {
    const key = link.dataset.social;
    const url = CONFIG.social[key];
    if (urlReady(url)) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('Social link not set yet. Add the ' + link.textContent.trim() + ' URL to CONFIG.social.' + key + ' in script.js.');
      });
    }
  });

  /* ------------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------------ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();