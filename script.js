'use strict';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            window.scrollTo(0, 0);
            window.addEventListener('pageshow', () => {
                if (!document.querySelector('.entry.open')) window.scrollTo(0, 0);
            });

            // Decorative sparkles: lightweight, decorative only.
            (function(){
              const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              if(reduce)return;
              document.querySelectorAll(".entry-sparkles,.hero-sparkles").forEach(layer=>{
                for(let i=0;i<24;i++){
                  const s=document.createElement("i");s.className="glimmer";
                  s.style.left=(5+Math.random()*90)+"%";
                  s.style.top=(5+Math.random()*90)+"%";
                  s.style.animationDelay=(Math.random()*6)+"s";
                  s.style.animationDuration=(3+Math.random()*4)+"s";
                  layer.appendChild(s);
                }
              });
            })();

            const entry = document.getElementById('entry')
              , openBtn = document.getElementById('openBtn')
              , main = document.getElementById('main')
              , musicBtn = document.getElementById('musicBtn')
              , bgm = document.getElementById('bgm');
            let opened = false
              , playing = false;
            // First interaction anywhere unlocks and starts invitation media.
            // This works with the current background audio and any <video> added later.
            let mediaUnlocked = false;
            async function startInvitationMedia() {
                if (mediaUnlocked) return;
                mediaUnlocked = true;
                const media = document.querySelectorAll('audio, video');
                media.forEach(item => {
                    const promise = item.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(() => {});
                    }
                });
                if (bgm && !bgm.paused) {
                    playing = true;
                    musicBtn.textContent = '♫';
                }
            }
            document.addEventListener('pointerdown', startInvitationMedia, { once: true, passive: true });
            document.addEventListener('touchstart', startInvitationMedia, { once: true, passive: true });
            document.addEventListener('keydown', startInvitationMedia, { once: true });

            function openInvitation() {
                if (opened) return;
                opened = true;
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                entry.classList.add('open');
                document.body.classList.remove('locked');
                bgm.play().then(() => {
                    playing = true;
                    musicBtn.textContent = '♫';
                }).catch(() => {});
                setTimeout(() => {
                    main.classList.add('visible');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 450);
                setTimeout(() => entry.remove(), 2100);
            }

            // Open the invitation when the guest taps/clicks anywhere on the door screen.
            entry.addEventListener('click', openInvitation);
            musicBtn.addEventListener('click', async () => {
                if (bgm.paused) {
                    try {
                        await bgm.play();
                        playing = true;
                        musicBtn.textContent = '♫'
                    } catch (e) {}
                } else {
                    bgm.pause();
                    playing = false;
                    musicBtn.textContent = '♪'
                }
            }
            );

            function showerPetals() {
                const layer = document.getElementById('petals');
                for (let i = 0; i < 48; i++) {
                    const p = document.createElement('div');
                    p.className = 'petal';
                    p.style.left = (Math.random() * 100) + 'vw';
                    p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
                    p.style.animationDelay = (Math.random() * .65) + 's';
                    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
                    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
                    layer.appendChild(p);
                    setTimeout( () => p.remove(), 5200)
                }
            }

            // Countdown to marriage ceremony in India time.
            const target = new Date('2026-11-15T07:45:00+05:30').getTime();
            function updateCountdown() {
                const diff = Math.max(0, target - Date.now());
                const d = Math.floor(diff / 86400000)
                  , h = Math.floor(diff % 86400000 / 3600000)
                  , m = Math.floor(diff % 3600000 / 60000)
                  , s = Math.floor(diff % 60000 / 1000);
                document.getElementById('days').textContent = String(d).padStart(3, '0');
                document.getElementById('hours').textContent = String(h).padStart(2, '0');
                document.getElementById('mins').textContent = String(m).padStart(2, '0');
                document.getElementById('secs').textContent = String(s).padStart(2, '0')
            }
            updateCountdown();
            setInterval(updateCountdown, 1000);

            // Smooth reveal as each invitation section enters the viewport.
            const revealObserver = new IntersectionObserver( (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                }
                )
            }
            ,{
                threshold: .12,
                rootMargin: '0px 0px -8% 0px'
            });
            document.querySelectorAll('.reveal-section').forEach(el => revealObserver.observe(el));



            // Native share sheet on supported devices; clipboard fallback on others.
            document.getElementById('shareLocation').addEventListener('click',async () => {
                const url='https://maps.app.goo.gl/NVXcCCZq2K7c6fYa9?g_st=aw';
                const feedback=document.getElementById('venueFeedback');
                try {
                    if(navigator.share) {
                        await navigator.share({title:'Ramesh & Tamil Selvi Wedding Venue',text:'Join us at Kurinjii Mahal, Tiruppur on 15 November 2026!',url});
                        feedback.textContent='Location shared ♥';
                    } else if(navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(url);
                        feedback.textContent='Location link copied!';
                    } else {
                        const a=document.createElement('textarea');a.value=url;document.body.appendChild(a);a.select();
                        const ok=document.execCommand('copy');a.remove();
                        feedback.textContent=ok?'Location link copied!':'Open the location link to share it.';
                    }
                } catch(error) { if(error.name!=='AbortError') feedback.textContent='Please use View Location to share the link.'; }
            });

            // Photo gallery + accessible full-screen preview (lightbox).
            const galleryPhotos = Array.from(document.querySelectorAll('.gallery-tile'));
            const galleryLightbox = document.getElementById('galleryLightbox');
            if (galleryPhotos.length && galleryLightbox) {
                const galleryImage = document.getElementById('galleryImage');
                const galleryStage = galleryLightbox.querySelector('.gallery-stage');
                const galleryCaption = document.getElementById('galleryCaption');
                const galleryCount = document.getElementById('galleryCount');
                const galleryThumbs = document.getElementById('galleryThumbs');
                const galleryClose = document.getElementById('galleryClose');
                const mainEl = document.getElementById('main');
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const total = galleryPhotos.length;
                let galleryIndex = 0;
                let galleryTrigger = null;
                let closeTimer = null;
                const isOpen = () => galleryLightbox.classList.contains('is-open');

                // Thumbnail strip
                const galleryThumbButtons = galleryPhotos.map((tile, i) => {
                    const src = tile.querySelector('img');
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'gallery-thumb';
                    btn.setAttribute('aria-label', `Show photo ${i + 1}: ${src.alt}`);
                    const t = document.createElement('img');
                    t.src = src.getAttribute('src');
                    t.alt = '';
                    t.draggable = false;
                    btn.appendChild(t);
                    btn.addEventListener('click', () => { if (i !== galleryIndex) showGalleryPhoto(i, i > galleryIndex ? 1 : -1); });
                    galleryThumbs.appendChild(btn);
                    return btn;
                });

                function showGalleryPhoto(index, dir = 0) {
                    galleryIndex = (index + total) % total;
                    const source = galleryPhotos[galleryIndex].querySelector('img');
                    const url = source.currentSrc || source.src;

                    galleryStage.classList.add('is-loading');
                    galleryStage.classList.remove('is-error');
                    galleryImage.classList.remove('anim-next', 'anim-prev');

                    const done = () => {
                        galleryStage.classList.remove('is-loading');
                        if (dir && !reduceMotion) {
                            void galleryImage.offsetWidth; // restart animation
                            galleryImage.classList.add(dir > 0 ? 'anim-next' : 'anim-prev');
                        }
                    };
                    const fail = () => {
                        galleryStage.classList.remove('is-loading');
                        galleryStage.classList.add('is-error');
                    };
                    galleryImage.alt = source.alt;
                    if (galleryImage.src === url && galleryImage.complete && galleryImage.naturalWidth) {
                        done();
                    } else {
                        galleryImage.onload = done;
                        galleryImage.onerror = fail;
                        galleryImage.src = url;
                    }

                    galleryCaption.textContent = source.alt;
                    galleryCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

                    galleryThumbButtons.forEach((b, i) => {
                        b.classList.toggle('is-active', i === galleryIndex);
                        if (i === galleryIndex) {
                            b.setAttribute('aria-current', 'true');
                            galleryThumbs.scrollTo({
                                left: b.offsetLeft - (galleryThumbs.clientWidth - b.offsetWidth) / 2,
                                behavior: reduceMotion || !isOpen() ? 'auto' : 'smooth'
                            });
                        } else {
                            b.removeAttribute('aria-current');
                        }
                    });

                    // Preload neighbours so next/prev feels instant
                    [galleryIndex - 1, galleryIndex + 1].forEach(i => {
                        const n = galleryPhotos[(i + total) % total].querySelector('img');
                        const pre = new Image();
                        pre.src = n.currentSrc || n.src;
                    });
                }

                function openGallery(index, trigger) {
                    clearTimeout(closeTimer);
                    galleryTrigger = trigger;
                    galleryLightbox.hidden = false;
                    document.documentElement.classList.add('gallery-open');
                    document.body.classList.add('gallery-open');
                    if (mainEl) mainEl.inert = true;
                    showGalleryPhoto(index);
                    void galleryLightbox.offsetWidth; // flush so the fade-in transition runs
                    galleryLightbox.classList.add('is-open');
                    galleryClose.focus({ preventScroll: true });
                }

                function closeGallery() {
                    if (!isOpen()) return;
                    galleryLightbox.classList.remove('is-open');
                    document.documentElement.classList.remove('gallery-open');
                    document.body.classList.remove('gallery-open');
                    if (mainEl) mainEl.inert = false;
                    if (galleryTrigger) galleryTrigger.focus({ preventScroll: true });
                    closeTimer = setTimeout(() => { galleryLightbox.hidden = true; }, reduceMotion ? 0 : 280);
                }

                galleryPhotos.forEach((tile, index) => tile.addEventListener('click', () => openGallery(index, tile)));
                galleryClose.addEventListener('click', closeGallery);
                document.getElementById('galleryPrev').addEventListener('click', () => showGalleryPhoto(galleryIndex - 1, -1));
                document.getElementById('galleryNext').addEventListener('click', () => showGalleryPhoto(galleryIndex + 1, 1));

                // Click on the dark backdrop (anywhere that isn't a control or the photo) closes the preview
                galleryLightbox.addEventListener('click', e => {
                    if (!e.target.closest('button, img, figcaption, .gallery-count, .gallery-thumbs')) closeGallery();
                });

                document.addEventListener('keydown', e => {
                    if (!isOpen()) return;
                    if (e.key === 'Escape') closeGallery();
                    else if (e.key === 'ArrowRight') showGalleryPhoto(galleryIndex + 1, 1);
                    else if (e.key === 'ArrowLeft') showGalleryPhoto(galleryIndex - 1, -1);
                    else if (e.key === 'Home') { e.preventDefault(); showGalleryPhoto(0, -1); }
                    else if (e.key === 'End') { e.preventDefault(); showGalleryPhoto(total - 1, 1); }
                    else if (e.key === 'Tab') {
                        const buttons = [...galleryLightbox.querySelectorAll('button')];
                        const first = buttons[0], last = buttons[buttons.length - 1];
                        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                    }
                });

                // Touch: swipe left/right to change photo, swipe down to close
                let touchStart = null;
                galleryLightbox.addEventListener('touchstart', e => {
                    if (e.target.closest('.gallery-thumbs') || e.touches.length > 1) { touchStart = null; return; }
                    touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
                }, { passive: true });
                galleryLightbox.addEventListener('touchend', e => {
                    if (!touchStart) return;
                    const dx = e.changedTouches[0].clientX - touchStart.x;
                    const dy = e.changedTouches[0].clientY - touchStart.y;
                    touchStart = null;
                    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) showGalleryPhoto(galleryIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
                    else if (dy > 90 && Math.abs(dx) < 60) closeGallery();
                }, { passive: true });
            }

            // Floating hearts and stars in the countdown section.
            const countdownHearts = document.getElementById('countdownHearts');
            if (countdownHearts && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                for (let i = 0; i < 24; i++) {
                    const spark = document.createElement('i');
                    spark.textContent = i % 3 === 0 ? '✦' : '♥';
                    spark.style.cssText = `left:${Math.random()*100}%;font-size:${10+Math.random()*18}px;animation-duration:${9+Math.random()*10}s;animation-delay:${-Math.random()*19}s;--drift-x:${Math.random()*130-65}px`;
                    countdownHearts.appendChild(spark);
                }
            }
            // Scroll-to-top control.
            const scrollTopBtn = document.getElementById('scrollTopBtn');
            const syncScrollTop = () => scrollTopBtn.classList.toggle('is-visible', window.scrollY > 450);
            window.addEventListener('scroll', syncScrollTop, {passive:true});
            syncScrollTop();
            scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));

/* =========================================================
   SECTION SCROLL REVEAL
========================================================= */

const sectionRevealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target
              .classList
              .add('in-view');

          }

        }
      );

    },
    {
      threshold: 0.12
    }
  );



document
  .querySelectorAll(
    '.reveal'
  )
  .forEach(
    element =>
      revealObserver.observe(
        element
      )
  );


/* =========================================================
   SAVE THE DATE: photo, date plate, falling petals
========================================================= */
(function () {
  const sd = document.getElementById('saveDate');
  if (!sd) return;
  const plate = document.getElementById('sdPlate');
  const confetti = document.getElementById('sdConfetti');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Picture fades in as soon as the section opens.
  const openObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      sd.classList.add('photo-open');
      openObserver.disconnect();
    }
  }, { threshold: 0.12 });
  openObserver.observe(sd);

  function burst() {
    if (reduce || !confetti) return;
    const colors = ['#e9709a', '#f4a5be', '#f2a22b', '#e8662a', '#c9a858', '#ffffff'];
    const glyphs = ['\u2740', '\u273F', '\u2764', '\u2726'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span');
      p.className = 'sd-petal';
      p.textContent = glyphs[i % glyphs.length];
      p.style.left = (8 + Math.random() * 84) + '%';
      p.style.top = (30 + Math.random() * 20) + '%';
      p.style.setProperty('--s', (12 + Math.random() * 14) + 'px');
      p.style.setProperty('--c', colors[i % colors.length]);
      p.style.setProperty('--d', (2.6 + Math.random() * 1.8) + 's');
      p.style.setProperty('--dl', (Math.random() * 0.9) + 's');
      p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--dy', (140 + Math.random() * 200) + 'px');
      p.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
      confetti.appendChild(p);
      setTimeout(() => p.remove(), 6000);
    }
  }

  // Date plate and petals appear when the guest scrolls to the plate.
  const plateObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      sd.classList.add('is-revealed');
      burst();
      plateObserver.disconnect();
    }
  }, { threshold: 0.5 });
  plateObserver.observe(plate || sd);
})();

/* =========================================================
   EVENT VIDEOS
   AUTOPLAY WHEN VISIBLE
========================================================= */

const videoObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(
        entry => {

          const video =
            entry.target;


          if (
            entry.isIntersecting
          ) {

            video.muted = true;

            video.loop = true;

            video
              .play()
              .catch(() => {});

          } else {

            video.pause();

          }

        }
      );

    },
    {
      threshold: 0.45
    }
  );



document
  .querySelectorAll(
    '.lazy-video'
  )
  .forEach(
    video =>
      videoObserver.observe(video)
  );

/* =========================================================
   WISHES: FormSubmit.co (AJAX)
   1) Set WISHES_EMAIL below to the inbox that should receive wishes.
   2) Send one test wish. FormSubmit emails an activation link once;
      click it and the form is live.
========================================================= */
(() => {
  const WISHES_EMAIL = 'dineshkumarpdk33@gmail.com';
  const WISHES_CC_EMAIL = '';          // optional second inbox
  const WISH_STORE = 'wedding_wishes_v1';
  const WISH_LAST = 'wedding_wish_last';
  const WISH_COOLDOWN = 8000;
  const WISH_PAGE = 6;
  const STICKERS = ['🌸', '💐', '✨', '❤️', '🙏', '🎊', '🪔'];

  const $ = id => document.getElementById(id);
  const wishCard = $('wishCard'), wishForm = $('wishForm'), wishName = $('wishName'),
    wishRelation = $('wishRelation'), wishMessage = $('wishMessage'), wishCount = $('wishCount'),
    wishError = $('wishError'), wishSend = $('wishSend'), wishSendLabel = $('wishSendLabel'),
    wishThanks = $('wishThanks'), thanksTitle = $('thanksTitle'), thanksSticker = $('thanksSticker'),
    seeWish = $('seeWish'), writeAnother = $('writeAnother'), wishWall = $('wishWall'),
    wishWallHead = $('wishWallHead'), wishTotal = $('wishTotal'), wishMore = $('wishMore');

  if (!wishForm || !wishWall) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Overlays live on <body> so section transforms can't offset them
  const wishBurst = document.createElement('div');
  wishBurst.className = 'wish-burst';
  wishBurst.setAttribute('aria-hidden', 'true');
  document.body.appendChild(wishBurst);

  const toastEl = document.createElement('div');
  toastEl.className = 'w-toast';
  toastEl.setAttribute('role', 'status');
  document.body.appendChild(toastEl);
  let toastTimer;
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  let wishes = [];
  let shown = WISH_PAGE;

  /* ---------- helpers ---------- */
  const cleanText = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  const makeId = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function readLocal() {
    try {
      const list = JSON.parse(localStorage.getItem(WISH_STORE) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveLocal(wish) {
    try { localStorage.setItem(WISH_STORE, JSON.stringify([wish, ...readLocal()].slice(0, 50))); } catch (e) {}
  }
  function normalize(raw) {
    if (!raw) return null;
    const name = cleanText(raw.name, 40), message = cleanText(raw.message, 300);
    if (!name || !message) return null;
    return {
      id: String(raw.id || makeId()).slice(0, 64), name,
      relation: cleanText(raw.relation, 20),
      sticker: STICKERS.includes(raw.sticker) ? raw.sticker : '🌸',
      message, ts: Number(raw.ts) || 0
    };
  }

  /* ---------- wall ---------- */
  const noteObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); noteObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });

  function buildNote(wish, index, stagger, fresh) {
    const variant = [...wish.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 4;
    const note = document.createElement('article');
    note.className = `wish-note v${variant}` + (fresh ? ' fresh' : '');
    note.style.setProperty('--tilt', index % 3 === 2 ? '0deg' : (index % 2 ? '.6deg' : '-.6deg'));
    note.style.setProperty('--d', `${stagger * 0.08}s`);

    const sticker = document.createElement('span');
    sticker.className = 'wish-sticker';
    sticker.setAttribute('aria-hidden', 'true');
    sticker.textContent = wish.sticker;

    const head = document.createElement('div');
    head.className = 'wish-head';
    const avatar = document.createElement('span');
    avatar.className = 'wish-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = ([...wish.name][0] || '♥').toUpperCase();
    const who = document.createElement('div');
    who.className = 'wish-who';
    const name = document.createElement('span');
    name.className = 'wish-name';
    name.textContent = wish.name;
    who.appendChild(name);
    if (wish.relation) {
      const tag = document.createElement('span');
      tag.className = 'wish-tag';
      tag.textContent = wish.relation;
      who.appendChild(tag);
    }
    head.append(avatar, who);

    const text = document.createElement('p');
    text.textContent = wish.message;
    note.append(sticker, head, text);
    noteObserver.observe(note);
    return note;
  }

  function updateWallMeta() {
    const total = wishes.length;
    wishTotal.textContent = total ? `${total} ${total === 1 ? 'wish' : 'wishes'}` : '';
    wishMore.hidden = shown >= total;
  }

  function renderWall() {
    wishWall.textContent = '';
    if (!wishes.length) {
      const empty = document.createElement('p');
      empty.className = 'wish-empty';
      empty.textContent = 'Thank you for all the lovely wishes! ❤️';
      wishWall.appendChild(empty);
    } else {
      wishes.slice(0, shown).forEach((w, i) => wishWall.appendChild(buildNote(w, i, i % WISH_PAGE)));
    }
    updateWallMeta();
  }

  wishMore.addEventListener('click', () => {
    const from = shown;
    shown += WISH_PAGE;
    wishes.slice(from, shown).forEach((w, i) => wishWall.appendChild(buildNote(w, from + i, i)));
    updateWallMeta();
  });

  function addFreshWish(wish) {
    wishes.unshift(wish);
    shown += 1;
    const empty = wishWall.querySelector('.wish-empty');
    if (empty) empty.remove();
    wishWall.prepend(buildNote(wish, 0, 0, true));
    updateWallMeta();
  }

  /* ---------- form behaviour ---------- */
  const updateCount = () => { wishCount.textContent = `${wishMessage.value.length} / 300`; };

  function clearError() {
    wishError.textContent = '';
    wishForm.querySelectorAll('.w-field.invalid').forEach(f => f.classList.remove('invalid'));
  }
  function fail(input, message) {
    const field = input.closest('.w-field');
    wishError.textContent = message;
    field.classList.add('invalid');
    field.classList.remove('w-shake');
    void field.offsetWidth;
    field.classList.add('w-shake');
    input.focus();
  }

  wishMessage.addEventListener('input', () => { updateCount(); clearError(); });
  wishName.addEventListener('input', clearError);

  document.querySelectorAll('.w-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const current = wishMessage.value.trim();
      const next = current ? `${current} ${chip.dataset.text}` : chip.dataset.text;
      if (next.length > 300) { showToast('Message is full'); return; }
      wishMessage.value = next;
      updateCount();
      clearError();
      chip.classList.remove('added');
      void chip.offsetWidth;
      chip.classList.add('added');
    });
  });

  function sparkBurst(cx, cy, count) {
    if (reduceMotion) return;
    const glyphs = ['♥', '✦', '✿', '✧', '🌸', '✨', '♥'];
    const pieces = [];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 190;
      piece.className = 'burst-piece';
      piece.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      piece.style.left = `${cx}px`;
      piece.style.top = `${cy}px`;
      piece.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
      piece.style.setProperty('--y', `${Math.sin(angle) * dist + 50}px`);
      piece.style.setProperty('--r', `${Math.random() * 540 - 270}deg`);
      piece.style.setProperty('--d', `${1.4 + Math.random() * 1.2}s`);
      piece.style.setProperty('--delay', `${Math.random() * 0.15}s`);
      wishBurst.appendChild(piece);
      pieces.push(piece);
    }
    setTimeout(() => pieces.forEach(p => p.remove()), 3200);
  }

  // Sends the wish to your inbox through FormSubmit.co
  async function postWish(wish) {
    try {
      const payload = {
        _subject: `New wedding wish from ${wish.name}`,
        _template: 'table',
        _captcha: 'false',
        Name: wish.name,
        Relation: wish.relation || '-',
        Sticker: wish.sticker,
        Wish: wish.message
      };
      if (WISHES_CC_EMAIL) payload._cc = WISHES_CC_EMAIL;

      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(WISHES_EMAIL)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false || data.success === 'false') {
        throw new Error(data.message || 'FormSubmit rejected the submission');
      }
      saveLocal(wish);
      return true;
    } catch (err) {
      console.warn('Wish not sent:', err);
      return false;
    }
  }

  wishForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (wishForm.elements.website.value) return; // honeypot

    clearError();
    const name = cleanText(wishName.value, 40);
    const message = cleanText(wishMessage.value, 300);
    const relation = cleanText(wishRelation.value, 20);
    const picked = wishForm.elements.sticker.value;
    const sticker = STICKERS.includes(picked) ? picked : '🌸';

    if (!name) { fail(wishName, 'Please add your name.'); return; }
    if (message.length < 3) { fail(wishMessage, 'Write a few words for the couple.'); return; }

    let last = 0;
    try { last = Number(localStorage.getItem(WISH_LAST)) || 0; } catch (err) {}
    if (Date.now() - last < WISH_COOLDOWN) {
      fail(wishMessage, 'Please wait a few seconds before sending another wish.');
      return;
    }

    const wish = { id: makeId(), name, relation, sticker, message, ts: Date.now() };

    wishSend.disabled = true;
    wishSendLabel.textContent = 'Sending…';
    wishCard.style.minHeight = `${wishCard.offsetHeight}px`;
    wishCard.classList.add('sealing');

    const sending = postWish(wish);
    await wait(1000);

    const rect = wishCard.getBoundingClientRect();
    sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 46);

    const ok = await sending;
    await wait(600);
    wishCard.classList.remove('sealing');

    if (!ok) {
      wishCard.style.minHeight = '';
      wishSend.disabled = false;
      wishSendLabel.textContent = 'Send Wishes';
      fail(wishMessage, 'Could not send right now. Please check your connection and try again.');
      return;
    }

    try { localStorage.setItem(WISH_LAST, String(Date.now())); } catch (err) {}

    thanksTitle.textContent = `Thank you, ${name}`;
    thanksSticker.textContent = sticker;
    wishForm.hidden = true;
    wishThanks.hidden = false;
    wishCard.classList.add('done');
    addFreshWish(wish);
  });

  writeAnother.addEventListener('click', () => {
    wishMessage.value = '';
    wishRelation.value = '';
    updateCount();
    wishThanks.hidden = true;
    wishForm.hidden = false;
    wishCard.classList.remove('done');
    wishCard.style.minHeight = '';
    wishSend.disabled = false;
    wishSendLabel.textContent = 'Send Wishes';
    wishMessage.focus({ preventScroll: true });
  });

  seeWish.addEventListener('click', () => {
    wishWallHead.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  wishes = readLocal().map(normalize).filter(Boolean).sort((a, b) => b.ts - a.ts);
  updateCount();
  renderWall();
})();
