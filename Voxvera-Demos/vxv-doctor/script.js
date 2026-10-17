/* ==========================================================================
   CarePoint Health — script.js
   Vanilla JavaScript, no dependencies. Fictional demo website.

   Contents
     1. CONFIGURATION   contact, WhatsApp and form settings
     2. DATA            specialties and sample doctors (edit these lists)
     3. Helpers
     4. Navigation, smooth scrolling, scroll reveal, missing-image notice
     5. Specialties and doctor directory (render, filter, details modal)
     6. FAQ accordion
     7. Appointment form
     8. Contact links
   ========================================================================== */
(() => {
  'use strict';

  /* ========================================================================
     1. CONFIGURATION: edit these values when customising for a real client
     ======================================================================== */
  const CONFIG = {
    businessName: 'CarePoint Health',

    // WHATSAPP NUMBER (the one place to set it): country code followed by the
    // number, digits only, with no "+", spaces or dashes. Example format:
    // 919876543210. While this still holds the placeholder text, every
    // WhatsApp button shows a reminder instead of opening a chat.
    whatsappNumber: 'YOUR_WHATSAPP_NUMBER_HERE',

    // Full URL for "Get directions" (for example a Google Maps share link).
    // While empty, the link shows a reminder instead.
    directionsUrl: '',

    // Appointment form endpoint. Leave empty to run the form in demo mode,
    // where NOTHING is sent anywhere. To go live, set this to an https URL
    // that accepts a JSON POST. IMPORTANT: the form carries patient contact
    // details, so use only an endpoint run by the clinic itself, or by a
    // provider approved for patient data. Do not send it to a general
    // third-party form service without that approval. This site never saves
    // anything in the browser (no localStorage, sessionStorage or cookies).
    formEndpoint: ''
  };

  const whatsappReady = () => /^\d{8,15}$/.test(CONFIG.whatsappNumber);
  const endpointReady = () => /^https:\/\//i.test(CONFIG.formEndpoint);
  const urlReady = (url) => /^https?:\/\//i.test(url || '');

  /* ========================================================================
     2. DATA: add, remove or rename entries to customise the site
     ------------------------------------------------------------------------
     SPECIALTIES  { id, name, icon, description }
       id   : short unique key, lowercase with hyphens
       icon : one of the keys in ICONS below
     DOCTORS      { id, name, specialty, availability, focus }
       specialty : must match a SPECIALTIES id
     All doctors below are FICTIONAL demonstration profiles. They list no
     qualifications, registrations or experience.
     ======================================================================== */
  const SPECIALTIES = [
    { id: 'general-medicine', name: 'General Medicine', icon: 'general',
      description: 'First point of contact for everyday health concerns and ongoing care.' },
    { id: 'dermatology', name: 'Dermatology', icon: 'skin',
      description: 'Care for conditions of the skin, hair and nails.' },
    { id: 'cardiology', name: 'Cardiology', icon: 'heart',
      description: 'Care related to the heart and blood circulation.' },
    { id: 'neurology', name: 'Neurology', icon: 'nerve',
      description: 'Care related to the brain, spine and nervous system.' },
    { id: 'dentistry', name: 'Dentistry', icon: 'tooth',
      description: 'Dental check-ups and care for teeth and gums.' },
    { id: 'orthopedics', name: 'Orthopedics', icon: 'bone',
      description: 'Care for bones, joints and muscles.' },
    { id: 'pediatrics', name: 'Pediatrics', icon: 'child',
      description: 'Healthcare for infants, children and adolescents.' },
    { id: 'gynecology', name: 'Gynecology', icon: 'women',
      description: "Women's health, from routine check-ups to specialist care." },
    { id: 'ophthalmology', name: 'Ophthalmology', icon: 'eye',
      description: 'Eye examinations and care for vision-related concerns.' },
    { id: 'ent', name: 'ENT', icon: 'ear',
      description: 'Care for the ear, nose and throat.' },
    { id: 'psychiatry', name: 'Psychiatry', icon: 'mind',
      description: 'Support for mental health and emotional wellbeing.' },
    { id: 'gastroenterology', name: 'Gastroenterology', icon: 'gut',
      description: 'Care for the digestive system, stomach and liver.' }
  ];

  const SAMPLE_ABOUT = 'This is a fictional sample profile that shows how a doctor\'s focus area and consultation days could be presented. A real clinic would add its own biography here.';

  const DOCTORS = [
    { id: 'dr-sample-1', name: 'Dr. Meera Kulkarni', specialty: 'general-medicine',
      availability: 'Mon, Wed, Fri · 10:00 – 13:00 (sample)', focus: 'Everyday health concerns and follow-up care.' },
    { id: 'dr-sample-2', name: 'Dr. Arjun Deshmukh', specialty: 'dermatology',
      availability: 'Tue, Thu · 11:00 – 15:00 (sample)', focus: 'Skin, hair and nail concerns.' },
    { id: 'dr-sample-3', name: 'Dr. Kavya Nair', specialty: 'cardiology',
      availability: 'Mon, Thu · 09:00 – 12:00 (sample)', focus: 'Heart and circulation care.' },
    { id: 'dr-sample-4', name: 'Dr. Rohan Iyer', specialty: 'neurology',
      availability: 'Wed, Sat · 10:00 – 14:00 (sample)', focus: 'Brain, spine and nerve-related concerns.' },
    { id: 'dr-sample-5', name: 'Dr. Sana Qureshi', specialty: 'dentistry',
      availability: 'Mon – Sat · 12:00 – 17:00 (sample)', focus: 'Dental check-ups and routine dental care.' },
    { id: 'dr-sample-6', name: 'Dr. Vikram Patil', specialty: 'orthopedics',
      availability: 'Tue, Fri · 10:00 – 13:00 (sample)', focus: 'Bone, joint and muscle concerns.' },
    { id: 'dr-sample-7', name: 'Dr. Ishita Rao', specialty: 'pediatrics',
      availability: 'Mon – Fri · 09:00 – 12:00 (sample)', focus: 'Care for children and adolescents.' },
    { id: 'dr-sample-8', name: 'Dr. Neha Joshi', specialty: 'gynecology',
      availability: 'Tue, Thu, Sat · 11:00 – 14:00 (sample)', focus: "Women's health and routine check-ups." },
    { id: 'dr-sample-9', name: 'Dr. Aditya Menon', specialty: 'ophthalmology',
      availability: 'Wed, Fri · 10:00 – 13:00 (sample)', focus: 'Eye examinations and vision care.' },
    { id: 'dr-sample-10', name: 'Dr. Farah Siddiqui', specialty: 'ent',
      availability: 'Mon, Thu · 14:00 – 17:00 (sample)', focus: 'Ear, nose and throat concerns.' },
    { id: 'dr-sample-11', name: 'Dr. Pranav Bhatt', specialty: 'psychiatry',
      availability: 'Tue, Fri · 12:00 – 16:00 (sample)', focus: 'Mental health and emotional wellbeing.' },
    { id: 'dr-sample-12', name: 'Dr. Tara Mehta', specialty: 'gastroenterology',
      availability: 'Wed, Sat · 09:00 – 12:00 (sample)', focus: 'Digestive system and liver concerns.' }
  ];

  // Simple line icons (24 x 24 grid). Add a key here to use a new icon.
  const ICONS = {
    general: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/>',
    skin: '<path d="M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    nerve: '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 7h8M7 9l4 7M17 9l-4 7"/>',
    tooth: '<path d="M7 4c-2 0-3 2-3 4 0 3 2 4 2 8 0 2 1 4 2 4s1-3 2-4c.5-.5 1.5-.5 2 0 1 1 1 4 2 4s2-2 2-4c0-4 2-5 2-8 0-2-1-4-3-4-2 0-2 1-3 1s-1-1-3-1z"/>',
    bone: '<path d="M7 7l10 10"/><circle cx="5.5" cy="5.5" r="2"/><circle cx="8.5" cy="4" r="1.5"/><circle cx="4" cy="8.5" r="1.5"/><circle cx="18.5" cy="18.5" r="2"/><circle cx="15.5" cy="20" r="1.5"/><circle cx="20" cy="15.5" r="1.5"/>',
    child: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r="0.7" fill="currentColor"/><circle cx="15" cy="10" r="0.7" fill="currentColor"/>',
    women: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    ear: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 3-3 6a3 3 0 0 1-6 0"/><path d="M11 10a1 1 0 1 1 2 0"/>',
    mind: '<path d="M5 5h14v10H11l-4 4v-4H5z"/><path d="M9 9h6M9 12h4"/>',
    gut: '<path d="M9 3v4c0 3-4 3-4 7a6 6 0 0 0 12 0c0-3-3-3-3-6V6"/>'
  };

  /* ========================================================================
     3. Helpers
     ======================================================================== */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

  const specialtyById = (id) => SPECIALTIES.find((s) => s.id === id) || null;
  const doctorById = (id) => DOCTORS.find((d) => d.id === id) || null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function iconSvg(key) {
    const paths = ICONS[key] || ICONS.general;
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      paths + '</svg>';
  }

  function initials(name) {
    const words = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
    return ((words[0] || '?')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  }

  const toastEl = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 6000);
  }

  /* ========================================================================
     4. Navigation, smooth scrolling, scroll reveal, missing-image notice
     ======================================================================== */
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

  // Missing image detection: identify the file, never substitute another.
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

    const title = el('strong', '', 'Missing image files');
    const intro = el('span', '', 'Add these files to the assets/ folder (names are case-sensitive):');
    const list = el('ul');
    Array.from(missingImages).sort().forEach((src) => list.appendChild(el('li', '', src)));
    const close = el('button');
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
      console.warn('[CarePoint Health] Missing image file: ' + src);
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

  // While developing (opened from a file or from localhost), also check the
  // lazy-loaded images straight away, so a missing file is reported on load
  // rather than only when the visitor scrolls near it. On a live site this is
  // skipped, so lazy loading keeps saving bandwidth.
  const isLocalPreview = window.location.protocol === 'file:' ||
    ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  if (isLocalPreview) {
    $$('img[loading="lazy"]').forEach((img) => {
      const probe = new Image();
      probe.onerror = () => flagMissing(img);
      probe.src = img.getAttribute('src');
    });
  }

  /* ========================================================================
     5. Specialties and doctor directory
     ======================================================================== */
  const specialtyGrid = $('#specialty-grid');
  const doctorList = $('#doctor-list');
  const doctorSearch = $('#doctor-search');
  const doctorSpecialtySelect = $('#doctor-specialty');
  const doctorCount = $('#doctor-count');
  const doctorEmpty = $('#doctor-empty');
  const doctorFilters = { query: '', specialty: '' };

  // --- Specialties -------------------------------------------------------
  function renderSpecialties() {
    if (!specialtyGrid) return;
    SPECIALTIES.forEach((spec, index) => {
      const item = el('li', 'specialty reveal');
      item.style.setProperty('--delay', (index % 3) * 70 + 'ms');
      item.dataset.specialty = spec.id;

      const icon = el('span', 'spec-icon');
      icon.innerHTML = iconSvg(spec.icon);

      const actions = el('div', 'spec-actions');
      const request = el('a', '', 'Request appointment');
      request.href = '#appointment';
      request.dataset.specialty = spec.id;
      request.setAttribute('aria-label', 'Request an appointment in ' + spec.name);
      const doctors = el('a', '', 'View doctors');
      doctors.href = '#doctors';
      doctors.dataset.doctorFilter = spec.id;
      doctors.setAttribute('aria-label', 'View sample doctors in ' + spec.name);
      actions.append(request, doctors);

      item.append(icon, el('h3', '', spec.name), el('p', '', spec.description), actions);
      specialtyGrid.appendChild(item);
    });
  }

  // --- Doctors -------------------------------------------------------------
  function renderDoctors() {
    if (!doctorList) return;
    DOCTORS.forEach((doc, index) => {
      const spec = specialtyById(doc.specialty);
      const item = el('li', 'doctor reveal');
      item.style.setProperty('--delay', (index % 2) * 70 + 'ms');
      item.dataset.id = doc.id;
      item.dataset.search = (doc.name + ' ' + (spec ? spec.name : '') + ' ' + doc.specialty).toLowerCase();
      item.dataset.specialty = doc.specialty;

      const avatar = el('span', 'avatar', initials(doc.name));
      avatar.setAttribute('aria-hidden', 'true');

      const main = el('div', 'doc-main');
      main.append(
        el('span', 'badge', 'Fictional demo profile'),
        el('h3', '', doc.name),
        el('p', 'doc-spec', spec ? spec.name : doc.specialty),
        el('p', 'doc-avail', 'Availability: ' + doc.availability)
      );

      const actions = el('div', 'doc-actions');
      const details = el('button', 'btn btn--outline btn--small', 'View Details');
      details.type = 'button';
      details.dataset.doctorDetails = doc.id;
      details.setAttribute('aria-label', 'View details: ' + doc.name);
      const request = el('a', 'btn btn--primary btn--small', 'Request Appointment');
      request.href = '#appointment';
      request.dataset.specialty = doc.specialty;
      request.dataset.doctor = doc.id;
      request.setAttribute('aria-label', 'Request an appointment with ' + doc.name + ' (sample profile)');
      actions.append(details, request);

      item.append(avatar, main, actions);
      doctorList.appendChild(item);
    });

    if (doctorSpecialtySelect) {
      SPECIALTIES.forEach((spec) => {
        const option = el('option', '', spec.name);
        option.value = spec.id;
        doctorSpecialtySelect.appendChild(option);
      });
    }
  }

  function applyDoctorFilters() {
    if (!doctorList) return;
    const query = doctorFilters.query.trim().toLowerCase();
    let shown = 0;
    $$('.doctor', doctorList).forEach((item) => {
      const match =
        (!doctorFilters.specialty || item.dataset.specialty === doctorFilters.specialty) &&
        (!query || item.dataset.search.includes(query));
      item.hidden = !match;
      if (match) shown += 1;
    });

    if (doctorSearch) doctorSearch.value = doctorFilters.query;
    if (doctorSpecialtySelect) doctorSpecialtySelect.value = doctorFilters.specialty;

    if (doctorCount) {
      doctorCount.textContent = 'Showing ' + shown + ' of ' + DOCTORS.length + ' fictional sample profiles.';
    }
    if (doctorEmpty) doctorEmpty.hidden = shown !== 0;
  }

  function resetDoctorFilters() {
    doctorFilters.query = '';
    doctorFilters.specialty = '';
    applyDoctorFilters();
  }

  // Build lists before wiring anything that reads them.
  renderSpecialties();
  renderDoctors();

  if (doctorSearch) {
    doctorSearch.addEventListener('input', () => {
      doctorFilters.query = doctorSearch.value;
      applyDoctorFilters();
    });
  }
  if (doctorSpecialtySelect) {
    doctorSpecialtySelect.addEventListener('change', () => {
      doctorFilters.specialty = doctorSpecialtySelect.value;
      applyDoctorFilters();
    });
  }
  const doctorForm = $('#doctor-filters');
  if (doctorForm) doctorForm.addEventListener('submit', (event) => event.preventDefault());
  const resetBtn = $('#doctor-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetDoctorFilters);
  const emptyResetBtn = $('#doctor-empty-reset');
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetDoctorFilters);
  applyDoctorFilters();

  // --- Doctor details modal ----------------------------------------------
  const modal = $('#doctor-modal');
  let modalOpener = null;
  let activeDoctor = null;

  function addFact(list, label, value, isPlaceholder) {
    const row = el('div');
    const dt = el('dt', '', label);
    const dd = el('dd', isPlaceholder ? 'is-placeholder' : '', value);
    row.append(dt, dd);
    list.appendChild(row);
  }

  function fillModal(doc) {
    const spec = specialtyById(doc.specialty);
    $('#modal-avatar').textContent = initials(doc.name);
    $('#modal-title').textContent = doc.name;
    $('#modal-spec').textContent = spec ? spec.name : doc.specialty;
    $('#modal-about').textContent = doc.focus + ' ' + SAMPLE_ABOUT;

    const facts = $('#modal-facts');
    facts.textContent = '';
    addFact(facts, 'Specialty', spec ? spec.name : doc.specialty);
    addFact(facts, 'Sample availability', doc.availability);
    addFact(facts, 'Qualifications', '[To be added by the clinic]', true);
    addFact(facts, 'Registration number', '[To be added by the clinic]', true);
    addFact(facts, 'Languages', '[To be added by the clinic]', true);

    const request = $('#modal-request');
    request.dataset.specialty = doc.specialty;
    request.dataset.doctor = doc.id;
    request.setAttribute('aria-label', 'Request an appointment with ' + doc.name + ' (sample profile)');
  }

  function openModal(doc, opener) {
    if (!modal) return;
    activeDoctor = doc;
    modalOpener = opener || null;
    fillModal(doc);
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
    $$('[data-doctor-details]').forEach((button) => {
      button.addEventListener('click', () => {
        const doc = doctorById(button.dataset.doctorDetails);
        if (doc) openModal(doc, button);
      });
    });

    $('.modal-close', modal).addEventListener('click', closeModal);
    $('#modal-done').addEventListener('click', closeModal);
    modal.addEventListener('close', afterModalClose);

    // Clicking the dark backdrop (outside the dialog box) closes the modal.
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    // Fallback for browsers without <dialog>: Escape key.
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && typeof modal.showModal !== 'function') closeModal();
    });

    $('#modal-request').addEventListener('click', (event) => {
      event.preventDefault();
      const link = event.currentTarget;
      modalOpener = null;
      closeModal();
      preselectAppointment({ specialty: link.dataset.specialty, doctor: link.dataset.doctor });
      goTo('appointment');
    });
  }

  /* ========================================================================
     6. Smooth in-page navigation and data-attribute actions
     ======================================================================== */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;

    // WhatsApp and directions links are handled in section 8.
    if (link.hasAttribute('data-whatsapp-link') && whatsappReady()) return;
    if (link.hasAttribute('data-directions') && urlReady(CONFIG.directionsUrl)) return;
    if (link.hasAttribute('data-whatsapp-link') || link.hasAttribute('data-directions')) return;

    // "View doctors" links filter the directory by specialty.
    if (link.dataset.doctorFilter !== undefined) {
      doctorFilters.query = '';
      doctorFilters.specialty = link.dataset.doctorFilter;
      applyDoctorFilters();
    }

    // Enquiry links pre-select the specialty, doctor and message.
    if (link.dataset.specialty || link.dataset.doctor || link.dataset.message) {
      preselectAppointment({
        specialty: link.dataset.specialty,
        doctor: link.dataset.doctor,
        message: link.dataset.message
      });
    }

    event.preventDefault();
    goTo(id);
  });

  // Scroll reveal runs after the lists have been rendered.
  const revealEls = $$('.reveal');
  revealEls.forEach((item) => {
    if (item.dataset.delay) item.style.setProperty('--delay', item.dataset.delay + 'ms');
  });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealEls.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((item) => revealObserver.observe(item));
  }

  /* ========================================================================
     6b. FAQ accordion
     ======================================================================== */
  const faqButtons = $$('.faq-q');

  function setFaq(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(open));
    if (panel) panel.classList.toggle('is-open', open);
  }

  faqButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      setFaq(button, open);
    });

    // Up / Down / Home / End move between questions.
    button.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowDown') next = (index + 1) % faqButtons.length;
      else if (event.key === 'ArrowUp') next = (index - 1 + faqButtons.length) % faqButtons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = faqButtons.length - 1;
      if (next === null) return;
      event.preventDefault();
      faqButtons[next].focus();
    });
  });

  /* ========================================================================
     7. Appointment form
     ======================================================================== */
  const form = $('#appointment-form');
  const successPanel = $('#form-success');
  const statusEl = $('#form-status');
  const submitBtn = $('#submit-btn');
  const specialtySelect = $('#specialty');
  const doctorSelect = $('#doctor');
  const dateInput = $('#appt-date');
  const timeSelect = $('#appt-time');
  const messageInput = $('#message');
  const modeNote = $('#form-mode-note');
  let sending = false;

  const pad = (n) => String(n).padStart(2, '0');
  const dateString = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  if (modeNote && endpointReady()) {
    modeNote.textContent = 'Send us a request and the clinic will contact you to confirm. This is not a confirmed booking.';
  }

  // Populate the specialty and doctor lists from the DATA section.
  if (specialtySelect) {
    SPECIALTIES.forEach((spec) => {
      const option = el('option', '', spec.name);
      option.value = spec.id;
      specialtySelect.appendChild(option);
    });
    const unsure = el('option', '', 'Not sure / general advice');
    unsure.value = 'not-sure';
    specialtySelect.appendChild(unsure);
  }
  if (doctorSelect) {
    DOCTORS.forEach((doc) => {
      const spec = specialtyById(doc.specialty);
      const option = el('option', '', doc.name + ' (' + (spec ? spec.name : doc.specialty) + ', sample)');
      option.value = doc.id;
      doctorSelect.appendChild(option);
    });
  }

  // Earliest selectable date is today (local time). Past dates are blocked.
  if (dateInput) dateInput.min = dateString(new Date());

  /* Indian mobile numbers: 10 digits starting 6-9, optionally written with
     +91, 91 or a leading 0, and with spaces, dashes or brackets. */
  function checkIndianPhone(value) {
    const text = value.trim();
    if (!text) return 'Please enter your phone number.';
    if (!/^[+\d\s().-]+$/.test(text)) return 'Phone numbers can only contain digits, spaces and + - ( ).';
    const compact = text.replace(/[\s().-]/g, '');
    if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(compact)) {
      return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9 (with or without +91).';
    }
    return '';
  }

  function parseLocalDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const fieldDefs = [
    {
      id: 'patient-name',
      check: (value) => value.trim().length >= 2 ? '' : 'Please enter the patient\'s name.'
    },
    { id: 'phone', check: checkIndianPhone },
    {
      id: 'email',
      check: (value) => {
        const text = value.trim();
        if (!text) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? '' : 'Please enter a valid email address, or leave this blank.';
      }
    },
    {
      id: 'specialty',
      check: (value) => value ? '' : 'Please choose a specialty.'
    },
    {
      id: 'appt-date',
      check: (value) => {
        if (!value) return 'Please choose a preferred date.';
        const picked = parseLocalDate(value);
        if (!picked) return 'Please choose a valid date.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return picked < today ? 'Please choose today or a future date. Past dates cannot be requested.' : '';
      }
    },
    {
      id: 'appt-time',
      check: (value) => {
        if (!value) return 'Please choose a preferred time.';
        // If the date is today, the time must still be ahead of us.
        const picked = parseLocalDate(dateInput.value);
        const now = new Date();
        if (picked && dateString(picked) === dateString(now)) {
          const hour = Number(value.split(':')[0]);
          if (hour <= now.getHours()) return 'That time has already passed today. Please choose a later time or another date.';
        }
        return '';
      }
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

  function preselectAppointment({ specialty, doctor, message } = {}) {
    if (!form) return;
    if (successPanel && !successPanel.hidden) resetForm();

    if (doctor && doctorById(doctor)) {
      doctorSelect.value = doctor;
      specialty = specialty || doctorById(doctor).specialty;
    }
    if (specialty && (specialtyById(specialty) || specialty === 'not-sure')) {
      specialtySelect.value = specialty;
      setFieldError('specialty', '');
      // Keep the doctor choice consistent with the specialty.
      const chosen = doctorById(doctorSelect.value);
      if (chosen && chosen.specialty !== specialty) doctorSelect.value = '';
    }
    if (message && !messageInput.value.trim()) messageInput.value = message;
  }

  function collectRequest() {
    const specOption = specialtySelect.options[specialtySelect.selectedIndex];
    const docOption = doctorSelect.options[doctorSelect.selectedIndex];
    const timeOption = timeSelect.options[timeSelect.selectedIndex];
    const picked = parseLocalDate(dateInput.value);
    return {
      patientName: $('#patient-name').value.trim(),
      phone: $('#phone').value.trim(),
      email: $('#email').value.trim(),
      specialty: specOption ? specOption.textContent : '',
      doctor: doctorSelect.value ? docOption.textContent : '',
      date: picked
        ? picked.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : dateInput.value,
      dateValue: dateInput.value,
      time: timeOption ? timeOption.textContent : '',
      timeValue: timeSelect.value,
      message: messageInput.value.trim()
    };
  }

  function showSuccess(data, demoMode) {
    $('#success-name').textContent = data.patientName.split(/\s+/)[0];
    $('#success-eyebrow').textContent = demoMode ? 'Demo only: nothing was sent' : 'Request received';
    $('#success-text').textContent = demoMode
      ? 'This is a front-end demonstration. Your request has not been transmitted to anyone, and no appointment has been booked or confirmed. On a live site, the clinic would contact you to arrange a time.'
      : 'We have received your request. This is not a confirmed appointment: the clinic will contact you to confirm a time.';

    const summary = $('#success-summary');
    summary.textContent = '';
    [
      ['Specialty', data.specialty],
      ['Preferred doctor', data.doctor || 'No preference'],
      ['Preferred date', data.date],
      ['Preferred time', data.time],
      ['Phone', data.phone]
    ].forEach(([label, value]) => {
      const row = el('div', 'summary-row');
      row.append(el('dt', '', label), el('dd', '', value));
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

  async function submitRequest(data) {
    const response = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        patientName: data.patientName,
        phone: data.phone,
        email: data.email,
        specialty: data.specialty,
        doctor: data.doctor,
        preferredDate: data.dateValue,
        preferredTime: data.timeValue,
        message: data.message
      })
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

    // The time check depends on the date, and the doctor depends on the specialty.
    dateInput.addEventListener('change', () => {
      if (timeSelect.getAttribute('aria-invalid') === 'true' || timeSelect.value) {
        validateField(fieldDefs.find((d) => d.id === 'appt-time'));
      }
    });
    doctorSelect.addEventListener('change', () => {
      const chosen = doctorById(doctorSelect.value);
      if (chosen) {
        specialtySelect.value = chosen.specialty;
        setFieldError('specialty', '');
      }
    });
    specialtySelect.addEventListener('change', () => {
      const chosen = doctorById(doctorSelect.value);
      if (chosen && chosen.specialty !== specialtySelect.value) doctorSelect.value = '';
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending || !validateAll()) return;

      const data = collectRequest();

      if (!endpointReady()) {
        showSuccess(data, true);
        return;
      }

      sending = true;
      submitBtn.disabled = true;
      setStatus('Sending your request...', false);
      try {
        await submitRequest(data);
        setStatus('', false);
        showSuccess(data, false);
      } catch (error) {
        setStatus('Sorry, we could not send your request. Please try again, or use the contact details below.', true);
      } finally {
        sending = false;
        submitBtn.disabled = false;
      }
    });

    $('#new-request').addEventListener('click', () => {
      resetForm();
      $('#patient-name').focus();
    });
  }

  /* ========================================================================
     8. Contact links: WhatsApp and directions
     ======================================================================== */
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
      const hello = 'Hello ' + CONFIG.businessName + ', I would like to make an enquiry.';
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
    if (urlReady(CONFIG.directionsUrl)) {
      link.href = CONFIG.directionsUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('Directions link not set yet. Add your maps URL to CONFIG.directionsUrl in script.js.');
      });
    }
  });

  /* Footer year */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();