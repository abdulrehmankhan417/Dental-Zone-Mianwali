/*!
 * Dental Zone Mianwali — site scripts
 * Header scroll state, scroll-reveal, testimonial slider, 3D tooth (Three.js),
 * and the real appointment booking flow (Google Apps Script backend).
 */
(function () {
  'use strict';

  /* =========================================================
     CONFIG — replace with your own deployed Apps Script URL
     ========================================================= */
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
  var CLINIC_PHONE_DISPLAY = '0300-6093493';

  /* =========================================================
     Header scroll state
     ========================================================= */
  var header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* =========================================================
     Reduced motion preference
     ========================================================= */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     Scroll reveal
     ========================================================= */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-animate]').forEach(function (el, i) {
    el.style.transitionDelay = reduceMotion ? '0s' : (i % 6) * 0.05 + 's';
    io.observe(el);
  });

  /* =========================================================
     Mark decorative icons as hidden from assistive tech
     ========================================================= */
  document.querySelectorAll('.service-icon svg, .info-row .ico svg, .why-row .check, .logo .mark svg')
    .forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });

  /* =========================================================
     FAQ accordion
     ========================================================= */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // Close all other items (single-open accordion)
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* =========================================================
     Testimonial slider
     ========================================================= */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.t-slide'));
  var dotsWrap = document.getElementById('t-dots');
  var active = 0;
  var tInterval;

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function () { showSlide(i); });
      dotsWrap.appendChild(b);
    });

    function showSlide(i) {
      slides[active].classList.remove('active');
      dotsWrap.children[active].classList.remove('active');
      active = i;
      slides[active].classList.add('active');
      dotsWrap.children[active].classList.add('active');
    }

    function startAutoplay() {
      if (reduceMotion) return;
      tInterval = setInterval(function () { showSlide((active + 1) % slides.length); }, 5500);
    }

    startAutoplay();
    var slider = document.getElementById('t-slider');
    slider.addEventListener('mouseenter', function () { clearInterval(tInterval); });
    slider.addEventListener('mouseleave', startAutoplay);
  }

  /* =========================================================
     3D tooth (Three.js) — hero visual
     ========================================================= */
  function initTooth() {
    var canvas = document.getElementById('tooth-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    var container = canvas.parentElement;
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x8fd0ab, 0.7);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var warm = new THREE.PointLight(0xd9a441, 0.5, 20);
    warm.position.set(-3, -3, 4);
    scene.add(warm);

    var tooth = new THREE.Group();
    var enamelMat = new THREE.MeshStandardMaterial({ color: 0xf8faf6, roughness: 0.28, metalness: 0.04 });

    var crownGeo = new THREE.SphereGeometry(1.5, 48, 48);
    crownGeo.scale(1, 0.72, 1.05);
    var posAttr = crownGeo.attributes.position;
    for (var i = 0; i < posAttr.count; i++) {
      var y = posAttr.getY(i);
      if (y > 0.5) {
        var x = posAttr.getX(i), z = posAttr.getZ(i);
        posAttr.setY(i, y + Math.sin(x * 3) * Math.cos(z * 3) * 0.06);
      }
    }
    crownGeo.computeVertexNormals();
    var crown = new THREE.Mesh(crownGeo, enamelMat);
    crown.position.y = 1.15;
    tooth.add(crown);

    var rootGeo = new THREE.CylinderGeometry(0.42, 0.05, 2.4, 24);
    var rootL = new THREE.Mesh(rootGeo, enamelMat);
    rootL.position.set(-0.55, -1.15, 0);
    rootL.rotation.z = 0.16;
    tooth.add(rootL);
    var rootR = new THREE.Mesh(rootGeo, enamelMat);
    rootR.position.set(0.55, -1.15, 0);
    rootR.rotation.z = -0.16;
    tooth.add(rootR);

    var neckGeo = new THREE.SphereGeometry(1.05, 32, 32);
    neckGeo.scale(1, 0.4, 0.9);
    var neck = new THREE.Mesh(neckGeo, enamelMat);
    neck.position.y = 0.15;
    tooth.add(neck);

    tooth.scale.setScalar(1.15);
    scene.add(tooth);

    var shadowGeo = new THREE.CircleGeometry(1.9, 48);
    var shadowMat = new THREE.MeshBasicMaterial({ color: 0x0b3d2e, transparent: true, opacity: 0.12 });
    var shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.75;
    scene.add(shadowMesh);

    var dragging = false, lastX = 0, lastY = 0;
    var velX = 0.004, velY = 0;

    function pointerDown(x, y) { dragging = true; lastX = x; lastY = y; }
    function pointerMove(x, y) {
      if (!dragging) return;
      var dx = x - lastX, dy = y - lastY;
      velY = dx * 0.005;
      velX = dy * 0.005;
      tooth.rotation.y += velY;
      tooth.rotation.x += velX;
      lastX = x; lastY = y;
    }
    function pointerUp() { dragging = false; }

    canvas.addEventListener('mousedown', function (e) { pointerDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { pointerMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', function (e) { var t = e.touches[0]; pointerDown(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener('touchmove', function (e) { var t = e.touches[0]; pointerMove(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener('touchend', pointerUp);

    function animate() {
      requestAnimationFrame(animate);
      if (!dragging) {
        if (!reduceMotion) { tooth.rotation.y += velY; tooth.rotation.x += velX; }
        velY *= 0.965;
        velX *= 0.965;
        if (Math.abs(velY) < 0.0035 && !reduceMotion) velY = 0.0035;
      }
      tooth.rotation.x = Math.max(-0.6, Math.min(0.6, tooth.rotation.x));
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Defer the 3D scene very slightly so it never blocks first paint / LCP.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initTooth, { timeout: 1500 });
  } else {
    window.addEventListener('load', initTooth);
  }

  /* =========================================================
     Appointment booking — real submission to Google Apps Script
     ========================================================= */
  var form = document.getElementById('booking-form');
  if (!form) return;

  var submitBtn = form.querySelector('[data-submit-btn]');
  var btnLabel = submitBtn.querySelector('.btn-label');
  var btnSpinner = submitBtn.querySelector('.btn-spinner');
  var statusBox = document.getElementById('form-status');
  var isSubmitting = false;
  var lastSubmitAt = 0;

  var fields = {
    fname: form.querySelector('#fname'),
    lname: form.querySelector('#lname'),
    phone: form.querySelector('#phone'),
    service: form.querySelector('#service'),
    date: form.querySelector('#date'),
    honeypot: form.querySelector('#company') // hidden trap field, humans never fill this
  };

  function setFieldError(field, message) {
    var errorEl = document.getElementById(field.id + '-error');
    if (errorEl) errorEl.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function sanitize(value) {
    return String(value || '').trim().replace(/[<>]/g, '');
  }

  function isValidPhone(value) {
    return /^[0-9+\-\s()]{7,16}$/.test(value);
  }

  function isValidDate(value) {
    if (!value) return true; // date is optional
    var chosen = new Date(value + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return chosen >= today;
  }

  function validateForm(data) {
    var valid = true;

    if (!data.firstName) { setFieldError(fields.fname, 'First name is required.'); valid = false; }
    else setFieldError(fields.fname, '');

    if (!data.lastName) { setFieldError(fields.lname, 'Last name is required.'); valid = false; }
    else setFieldError(fields.lname, '');

    if (!data.phone) { setFieldError(fields.phone, 'Phone number is required.'); valid = false; }
    else if (!isValidPhone(data.phone)) { setFieldError(fields.phone, 'Enter a valid phone number.'); valid = false; }
    else setFieldError(fields.phone, '');

    if (!isValidDate(data.date)) { setFieldError(fields.date, 'Please choose today or a future date.'); valid = false; }
    else setFieldError(fields.date, '');

    return valid;
  }

  function showStatus(type, message) {
    statusBox.textContent = message;
    statusBox.className = 'form-status ' + type;
    statusBox.hidden = false;
  }

  function setLoading(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    if (btnLabel) btnLabel.textContent = loading ? 'Sending…' : 'Request appointment';
    if (btnSpinner) btnSpinner.hidden = !loading;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Prevent double / rapid-fire submissions
    if (isSubmitting) return;
    if (Date.now() - lastSubmitAt < 8000) {
      showStatus('error', 'Your request is already being sent — please wait a few seconds.');
      return;
    }

    var data = {
      firstName: sanitize(fields.fname.value),
      lastName: sanitize(fields.lname.value),
      phone: sanitize(fields.phone.value),
      service: sanitize(fields.service.value),
      date: sanitize(fields.date.value),
      honeypot: fields.honeypot ? fields.honeypot.value : ''
    };

    // Silent bot trap: if the hidden honeypot field has a value, a bot filled it.
    // Pretend success without contacting the backend.
    if (data.honeypot) {
      form.reset();
      showStatus('success', 'Appointment request submitted successfully.');
      return;
    }

    if (!validateForm(data)) {
      showStatus('error', 'Please fix the highlighted fields and try again.');
      return;
    }

    setLoading(true);
    statusBox.hidden = true;
    lastSubmitAt = Date.now();

    var payload = {
      name: data.firstName + ' ' + data.lastName,
      phone: data.phone,
      service: data.service,
      date: data.date,
      source: 'website'
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // text/plain avoids a CORS pre-flight request against Apps Script web apps
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function (result) {
        if (result && result.result === 'success') {
          form.reset();
          showStatus('success', 'Appointment request submitted successfully. We will confirm by phone shortly.');
        } else {
          showStatus('error', (result && result.message) || ('Something went wrong. Please call us at ' + CLINIC_PHONE_DISPLAY + '.'));
        }
      })
      .catch(function () {
        showStatus('error', 'We could not reach the server. Please call us directly at ' + CLINIC_PHONE_DISPLAY + '.');
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
