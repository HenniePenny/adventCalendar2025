// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
  // ✅ Detect touch support and add a class to <body>
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch-device");
    console.log("Touch device detected – .touch-device class added.");
  }

  // ----- Elements -----
  const calendar = document.getElementById("calendar");
  const modal = document.getElementById("surpriseModal");
  const dialog = modal.querySelector(".modal-dialog"); // tabindex="-1" in HTML
  const modalBody = document.getElementById("modalBody");

  // ----- Language -----
  // Visitors whose browser is set to German get German messages and labels.
  const userLang = navigator.language || navigator.userLanguage || "";
  const isGerman = userLang.toLowerCase().startsWith("de");
  const closeButton = modal.querySelector(".modal-close");
  if (isGerman && closeButton) closeButton.setAttribute("aria-label", "Schließen");

  // ----- Date-gating config -----
  const realNow = new Date();
  const today = new Date(realNow);

  // --- Uncomment the two lines below for testing purposes: pretend today's date is Dec 12 for testing ---
  // today.setMonth(11);   // December (0-based)
  // today.setDate(12);

  // The calendar's clock runs from the test date when one is set, so doors
  // unlock and the midnight check work as they would on that day.
  const clockOffset = today.getTime() - realNow.getTime();
  const currentDate = () => new Date(Date.now() + clockOffset);

  let targetYear = today.getFullYear();
  const targetMonth = 11; // December

  // ----- Testing mode -----
  const FORCE_TESTING_MODE = false;
  // const autoTestingMode = today.getMonth() !== targetMonth; // now false
  const autoTestingMode = false;
  const testingMode = FORCE_TESTING_MODE || autoTestingMode; // false

  if (testingMode) {
    console.log(
      `🎁 Advent Calendar testing mode active — all doors unlocked for easy preview (${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}).`
    );
  }

  // ----- Resilient browser storage -----
  // Keep an in-memory copy so the calendar still works when browser storage
  // is blocked or full. Progress then lasts only for this page session.
  const sessionStorageFallback = new Map();
  const removedStorageKeys = new Set();
  function readSetting(key) {
    if (removedStorageKeys.has(key)) return null;
    if (sessionStorageFallback.has(key)) return sessionStorageFallback.get(key);
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) sessionStorageFallback.set(key, value);
      return value;
    } catch { return null; }
  }
  function writeSetting(key, value) {
    const text = String(value);
    removedStorageKeys.delete(key);
    sessionStorageFallback.set(key, text);
    try { window.localStorage.setItem(key, text); } catch {}
  }
  function removeSetting(key) {
    sessionStorageFallback.delete(key);
    removedStorageKeys.add(key);
    try { window.localStorage.removeItem(key); } catch {}
  }
  function readJSON(key, fallback) {
    try { return JSON.parse(readSetting(key)) ?? fallback; }
    catch { return fallback; }
  }
  const isDay = (day) => Number.isInteger(day) && day >= 1 && day <= 24;
  function readOpenedDays(key) {
    const value = readJSON(key, []);
    return Array.isArray(value) ? [...new Set(value.filter(isDay))] : [];
  }
  let openedDoorsKey = `openedDoors-${targetYear}-12`;
  let openedDoorsScoped = readOpenedDays(openedDoorsKey);
  let activeStoryDay = null;
  let storyOpener = null;
  let inertBackground = [];
  let previousOverflow = '';

  // 🪄 Testing badge
  if (testingMode) {
    const badge = document.createElement("div");
    badge.textContent = "🧪 Testing Mode Active – All Doors Unlocked";
    Object.assign(badge.style, {
      position: "fixed",
      bottom: "0.75rem",
      right: "0.75rem",
      background: "rgba(46, 139, 87, 0.9)",
      color: "#fff",
      fontSize: "0.9rem",
      fontFamily: "system-ui, sans-serif",
      padding: "0.4rem 0.75rem",
      borderRadius: "0.5rem",
      zIndex: "9999",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      pointerEvents: "none",
    });
    document.body.appendChild(badge);
  }

  // ----- Helpers -----
  function getYouTubeId(input) {
    if (!input) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.slice(1).split("/")[0];
      if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
        if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
        if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || u.pathname.split("/")[1];
      }
    } catch {}
    return null;
  }

  function openModal(opener) {
    // Remember the exact door, including when it was opened by a QR link.
    storyOpener = opener || document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Prevent keyboard and assistive-technology navigation into the page
    // behind the dialog. Restore each element's previous inert state later.
    inertBackground = Array.from(document.body.children)
      .filter((el) => el !== modal)
      .map((el) => ({ el, wasInert: el.hasAttribute('inert') }));
    inertBackground.forEach(({ el }) => el.setAttribute('inert', ''));
    if (dialog) dialog.focus();
    document.addEventListener('keydown', handleStoryKeydown);
  }

  function stopModalAudio() {
    const audio = modalBody.querySelector('audio');
    if (audio) {
      audio.pause();
      try { audio.currentTime = 0; } catch {}
    }
  }

  function closeModal() {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    stopModalAudio();
    modal.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
    modal.classList.remove('modal--media');
    document.removeEventListener('keydown', handleStoryKeydown);
    inertBackground.forEach(({ el, wasInert }) => {
      if (!wasInert) el.removeAttribute('inert');
    });
    inertBackground = [];
    document.body.style.overflow = previousOverflow;
    activeStoryDay = null;
    if (storyOpener && storyOpener.isConnected) storyOpener.focus();
    storyOpener = null;
  }

  // Focus guards wrap navigation only after native audio controls have
  // finished handling Tab, so every control in the player stays reachable.
  function storyControls() {
    return Array.from(dialog.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), audio[controls], ' +
      'iframe, [tabindex]:not([tabindex="-1"])'
    )).filter((el) => !el.hidden && !el.hasAttribute('data-focus-guard') && !el.closest('[inert]'));
  }
  for (const position of ['start', 'end']) {
    const guard = document.createElement('span');
    guard.tabIndex = 0;
    guard.setAttribute('data-focus-guard', position);
    guard.addEventListener('focus', () => {
      const controls = storyControls();
      const target = position === 'start' ? controls[controls.length - 1] : controls[0];
      (target || dialog).focus();
    });
    if (position === 'start') dialog.prepend(guard);
    else dialog.append(guard);
  }

  function handleStoryKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = storyControls();
    const first = controls[0];
    const last = controls[controls.length - 1];
    const current = document.activeElement;
    if (!first) {
      event.preventDefault();
      dialog.focus();
    } else if (event.shiftKey && (current === first || current === dialog || !dialog.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === dialog || !dialog.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  function renderSurprise(s) {
    stopModalAudio();
    document.getElementById("modalTitle").textContent = s?.title || "Surprise";
    modal.classList.remove("modal--media");
    modalBody.innerHTML = "";
    if (!s || !s.type) {
      modalBody.textContent = "Nothing here yet. Come back later!";
      return;
    }

    switch (s.type) {
      case "image":
        modal.classList.add("modal--media");
        const img = document.createElement("img");
        img.src = s.src;
        img.alt = s.alt || "";
        img.loading = "lazy";
        modalBody.appendChild(img);
        break;

      case "text":
        const wrap = document.createElement("div");
        wrap.className = "modal-text";
        if (s.title) {
          const h = document.createElement("h3");
          h.textContent = s.title;
          wrap.appendChild(h);
        }
        const p = document.createElement("p");
        p.textContent = s.body || "";
        wrap.appendChild(p);
        modalBody.appendChild(wrap);
        break;

      case "audio": {
        // Browser-native controls handle touch, seeking, and accessibility.
        // Playback never starts until the visitor presses Play.
        if (!s.src) {
          modalBody.textContent = "Audio unavailable.";
          break;
        }
        const audioWrap = document.createElement("div");
        audioWrap.className = "modal-audio";
        // Optional illustration shown above the player.
        if (s.image) {
          const art = document.createElement("img");
          art.src = s.image;
          art.alt = s.alt || "";
          art.className = "modal-audio-image";
          audioWrap.appendChild(art);
        }
        if (s.title) {
          const audioTitle = document.createElement("h3");
          audioTitle.textContent = s.title;
          audioWrap.appendChild(audioTitle);
        }
        if (s.description) {
          const description = document.createElement("p");
          description.textContent = s.description;
          audioWrap.appendChild(description);
        }
        const player = document.createElement("audio");
        player.tabIndex = 0;
        player.controls = true;
        player.preload = "metadata";
        player.src = s.src;
        player.setAttribute("aria-label", s.title || "Audio surprise");
        // The optional Santa laugh may still be playing from opening the door.
        // Stop it as soon as the visitor starts the story, so the two never overlap.
        player.addEventListener("play", () => {
          if (hohoho && !hohoho.paused) {
            hohoho.pause();
            hohoho.currentTime = 0;
          }
        });
        player.addEventListener("error", () => {
          // Avoid inserting duplicate warnings if the browser reports more than once.
          if (!audioWrap.querySelector(".audio-error")) {
            const warning = document.createElement("p");
            warning.className = "audio-error";
            warning.textContent = "This recording could not be loaded.";
            audioWrap.appendChild(warning);
          }
        });
        audioWrap.appendChild(player);
        modalBody.appendChild(audioWrap);
        break;
      }

      case "youtube":
        modal.classList.add("modal--media");
        const id = getYouTubeId(s.url || s.id);
        if (!id) {
          modalBody.textContent = "Video unavailable.";
          break;
        }
        if (hohoho && !hohoho.paused) {
          try { hohoho.pause(); } catch {}
        }
        const box = document.createElement("div");
        box.className = "modal-video";
        const iframe = document.createElement("iframe");
        const base = `https://www.youtube.com/embed/${id}`;
        const params = new URLSearchParams({
          autoplay: "0",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          enablejsapi: "1",
          origin: location.origin,
        });
        iframe.src = `${base}?${params.toString()}`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.title = s.title || "Video";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        box.appendChild(iframe);
        modalBody.appendChild(box);
        break;

      default:
        modalBody.textContent = "Unknown surprise type.";
    }
  }

  function renderDoorPreview(doorEl, s) {
    if (!s) return;
    if (s.type === "image") {
      doorEl.innerHTML = `<img src="${s.src}" alt="${s.alt || ""}" loading="lazy" style="max-width:100%;height:auto;border-radius:.5rem">`;
    } else if (s.type === "text") {
      doorEl.innerHTML = `<div class="door-text" style="padding:.25rem .5rem;font-size:.9rem;line-height:1.3">${s.title || s.body || "Text"}</div>`;
    } else if (s.type === "youtube") {
      doorEl.innerHTML = `<div class="door-video" style="font-size:.9rem">▶ ${s.title || "Watch video"}</div>`;
    } else if (s.type === "audio") {
      if (s.image) {
        // Show the illustration on the opened door, with a small note badge.
        const thumb = document.createElement("img");
        thumb.src = s.image;
        thumb.alt = s.alt || "";
        thumb.loading = "lazy";
        const badge = document.createElement("span");
        badge.className = "door-audio-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "♫";
        doorEl.classList.add("door--audio");
        doorEl.replaceChildren(thumb, badge);
      } else {
        const preview = document.createElement("div");
        preview.className = "door-audio";
        preview.textContent = "♫ " + (s.title || "Listen to audio");
        doorEl.replaceChildren(preview);
      }
    }
  }

  // ----- Surprises -----
  const surprises = [
    { type: "image", src: "assets/surprises/berlin-sugar-love.png", alt: "Festive gingerbread hearts with Berlin Christmas market charm and sweet holiday love" }, // 1
    { type: "image", src: "assets/surprises/The-Claus-Squad.webp", alt: "A cheerful lineup of foil-wrapped chocolate Santas standing in formation, ready to spread Christmas sweetness." }, // 2
    { type: "youtube", url: "https://youtu.be/-5iG-Kmt1iY?si=js8pv0D-i2mpzd60", title: "Christmas Comes But Once a Year (1936, Fleischer Studios)" }, // 3 🎥
    { type: "image", src: "assets/surprises/christmas_cat_santaclaws.webp", alt: "Adorable cat playfully peeking through decorated Christmas tree branches with festive curiosity" }, // 4
    { type: "image", src: "assets/surprises/ServingFace.webp", alt: "A classic red-and-gold nutcracker standing proudly against a background of twinkling Christmas lights" }, // 5
    { type: "image", src: "assets/surprises/The-early-bird-gets-Nikolaus.webp", alt: "A shiny red boot filled with chocolates and candy canes — proof that Nikolaus came by!" }, // 6
    { type: "youtube", url: "https://youtu.be/ve_sWSfX9uw?si=tZdqoWsx00XezlfN", title: "Rudolph the Red-Nosed Reindeer (Classic Cartoon)" }, // 7 🎥
    { type: "image", src: "assets/surprises/dreams-shine-brighter.png", alt: "Magnificent building facade at night with projected stars making dreams shine brighter during Christmas" }, // 8
    { type: "image", src: "assets/surprises/elf-esteem.webp", alt: "Festive elf-themed scene with holiday treats boosting Christmas elf-esteem and seasonal joy" }, // 9
    { type: "youtube", url: "https://youtu.be/yubLpbv0Vs4?si=JK_iwyDFm3opE5hu", title: "Jack Frost (1934, Ub Iwerks)" }, // 10 🎥
    { type: "image", src: "assets/surprises/soakingUp.webp", alt: "A gingerbread man enjoying a festive foam bath in a mug of hot cocoa" }, // 11
    { type: "image", src: "assets/surprises/FlourEverywhere.webp", alt: "A joyful Christmas baking mess — flour flying, cookie cutters scattered, and sweet magic in progress" }, // 12
    { type: "youtube", url: "https://youtu.be/hYKde7ARvnU?si=OIllor6wmYVHnJMl", title: "A Christmas Visit (1959 Animated Short)" }, // 13 🎥
    { type: "image", src: "assets/surprises/ThreeWiseWoofs.webp", alt: "Three festive dogs resting by a cozy Christmas backdrop, dressed in holiday hats and antlers" }, // 14
    { type: "youtube", url: "https://youtu.be/rHhTVZEGRaM?si=y1EVVqdZJtZYl-rQ", title: "Snow Foolin’ (1949, Famous Studios)" }, // 15 🎥
    { type: "image", src: "assets/surprises/next-stop-magic.png", alt: "Festive music scene with Christmas tunes filling the air, next stop is pure holiday magic" }, // 16
    { type: "image", src: "assets/surprises/santa-wants-extras.webp", alt: "Heartwarming scene of spreading Christmas cheer with Santa wanting extra holiday love and joy" }, // 17
    { type: "image", src: "assets/surprises/sip-sparkle-repeat.png", alt: "Sweet Christmas treats with sip, sparkle, and repeat vibes for perfect holiday indulgence" }, // 18
    { type: "youtube", url: "https://youtu.be/wIPcrTnSpSQ?si=3Zr-3anQmMhQw4Dy", title: "The Pups’ Christmas (1936, Happy Harmonies)" }, // 19 🎥
    { type: "image", src: "assets/surprises/peace-joy-sparkle.png", alt: "Peaceful Christmas message encouraging sending kind notes with sparkling joy and holiday spirit" }, // 20
    { type: "youtube", url: "https://youtu.be/zLhvCOOxH-Q?si=29fKBEUzsGHjk6bj", title: "Die Geschichte vom wahren Weihnachtsmann | NETTO" }, // 21 🎥
    { type: "image", src: "assets/surprises/The-calm-before-the-Claus.webp", alt: "Santa Claus carefully ironing his red suit, getting ready for the big night in a cozy Christmas setting" }, // 22
    { type: "youtube", url: "https://youtu.be/tl57Gy5X_Kg?si=ozd2m4o7Fmv1KIbc", title: "From Our Family To Yours | Disney Christmas Advert (2020)" }, // 23 🎥
    { type: "image", src: "assets/surprises/Officially-out-of-office.webp", alt: "Santa rocking his sunglasses, soaking up the after-Christmas chill — officially out of office" }, // 24
  ];

  // ----- Locked message -----
  function getLockedMessage() {
    const messages = isGerman
      ? [
          "Geduld, kleiner Wichtel! Diese Tür öffnet sich erst, wenn die Weihnachtsmagie bereit ist.",
          "Hoppla! Selbst der Weihnachtsmann darf nicht vorher gucken 🎅.",
          "Netter Versuch – aber diese Tür wickelt noch ihr Geheimnis ein 🎁.",
          "Zu früh! Die Wichtel sind noch mitten im Plätzchenbacken 🍪.",
          "Immer langsam mit den jungen Rentieren! Diese Tür braucht noch einen Moment 🦌.",
          "Diese Tür steht noch auf der Liste der unartigen Kinder – schau später nochmal vorbei 😜.",
          "🎄 Die Zukunft ist festlich… aber *heute* noch nicht. Komm später wieder!",
          "Der Weihnachtsmann prüft hier noch einmal alles ganz genau – versuch’s am richtigen Tag nochmal!",
        ]
      : [
          "Patience, little elf! This door opens when the Christmas magic says so.",
          "Whoa there! Even Santa can’t peek early 🎅.",
          "Nice try, but this door’s still wrapping its surprise! 🎁",
          "Too early! The elves are still baking today’s cookies 🍪.",
          "Hold your reindeer! This door isn’t ready yet 🦌.",
          "This one’s still on the naughty list — check back later! 😜",
          "🎄 The future is festive… but not *today*. Come back later!",
          "Santa’s still double-checking this one. Try again on the right day!",
        ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ----- Custom festive popup -----
  // Screen readers hear the message through a status region that stays
  // on the page. A region added at the same moment as its text is often
  // missed, so the text arrives a moment after the region is cleared.
  const lockedAnnouncer = document.createElement("div");
  lockedAnnouncer.className = "sr-only";
  lockedAnnouncer.setAttribute("role", "status");
  document.body.appendChild(lockedAnnouncer);
  let popupTimer;

  function showLockedPopup(message) {
    // Remove any existing *temporary* locked popup,
    // but keep the reset dialog (which also uses locked-popup styles)
    const existing = document.querySelector(".locked-popup:not(.reset-confirm)");
    if (existing) existing.remove();
    window.clearTimeout(popupTimer);

    // Create popup container. It is hidden from screen readers,
    // which get the same message from the status region instead.
    const popup = document.createElement("div");
    popup.className = "locked-popup";
    popup.setAttribute("aria-hidden", "true");
    popup.textContent = message;
    document.body.appendChild(popup);

    lockedAnnouncer.textContent = "";
    window.setTimeout(() => { lockedAnnouncer.textContent = message; }, 100);

    // Animate in
    requestAnimationFrame(() => popup.classList.add("visible"));

    // Close on click or after 6 seconds, long enough to read the longer messages
    popup.addEventListener("click", () => popup.remove());
    popupTimer = window.setTimeout(() => popup.remove(), 6000);
  }

  // ----- Sound -----
  let isSoundOn = false;
  const hohoho = new Audio("assets/hohoho.mp3");
  const toggleLabel = document.createElement("label");
  toggleLabel.className = "sound-toggle";
  toggleLabel.innerHTML = `
    <input type="checkbox" id="soundToggle">
    🔊 Enable "Ho Ho Ho" Sound
  `;
  const container = document.getElementById("soundToggleContainer");
  if (container) container.appendChild(toggleLabel);
  if (readSetting("soundEnabled") === "true") {
    isSoundOn = true;
    toggleLabel.querySelector("#soundToggle").checked = true;
  }
  toggleLabel.querySelector("#soundToggle").addEventListener("change", (e) => {
    isSoundOn = e.target.checked;
    writeSetting("soundEnabled", isSoundOn);
  });

  // ----- Door order -----
  let doorOrder = readJSON('doorOrder', null);
  // A saved order must contain each door exactly once.
  if (!Array.isArray(doorOrder) || doorOrder.length !== 24 ||
      !doorOrder.every(isDay) || new Set(doorOrder).size !== 24) {
    doorOrder = Array.from({ length: 24 }, (_, i) => i + 1);
    for (let i = doorOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doorOrder[i], doorOrder[j]] = [doorOrder[j], doorOrder[i]];
    }
    writeSetting("doorOrder", JSON.stringify(doorOrder));
  }

  // ----- Date rules and door state -----
  function canOpenDoor(day, now = currentDate()) {
    return testingMode || (now.getMonth() === targetMonth && day <= now.getDate());
  }
  function useProgressForYear(now) {
    if (targetYear === now.getFullYear()) return;
    targetYear = now.getFullYear();
    openedDoorsKey = `openedDoors-${targetYear}-12`;
    openedDoorsScoped = readOpenedDays(openedDoorsKey);
  }
  function updateDoor(door, now) {
    const day = Number(door.dataset.day);
    const allowed = canOpenDoor(day, now);
    const opened = allowed && openedDoorsScoped.includes(day);
    door.classList.toggle('locked', !allowed);
    if (allowed) delete door.dataset.locked;
    else door.dataset.locked = 'true';
    if (opened && door.dataset.opened !== 'true') {
      renderDoorPreview(door, surprises[day - 1]);
      door.dataset.opened = 'true';
    } else if (!opened && door.dataset.opened === 'true') {
      door.textContent = day;
      door.classList.remove('door--audio');
      delete door.dataset.opened;
    }
    door.classList.toggle('opened', opened);
    door.setAttribute('aria-label', doorLabel(day, allowed, opened));
  }
  // The label replaces the door's visible content for screen readers,
  // so an opened door names its surprise: the title, or the picture's alt text.
  function doorLabel(day, allowed, opened) {
    if (!allowed) {
      return isGerman
        ? `Tür ${day}, noch verschlossen. Öffnet sich am ${day}. Dezember.`
        : `Door ${day}, locked. Opens on December ${day}.`;
    }
    if (!opened) {
      return isGerman ? `Tür ${day}. Überraschung öffnen.` : `Door ${day}. Open the surprise.`;
    }
    const s = surprises[day - 1] || {};
    const name = s.title || s.alt;
    const door = isGerman
      ? (name ? `Tür ${day}: ${name}.` : `Tür ${day}, geöffnet.`)
      : (name ? `Door ${day}: ${name}.` : `Door ${day}, opened.`);
    const again = s.type === 'audio'
      ? (isGerman ? 'Noch einmal anhören.' : 'Listen again.')
      : s.type === 'youtube'
        ? (isGerman ? 'Video noch einmal ansehen.' : 'Watch the video again.')
        : (isGerman ? 'Überraschung noch einmal zeigen.' : 'Show the surprise again.');
    return `${door} ${again}`;
  }
  function refreshDoorAvailability() {
    const now = currentDate();
    useProgressForYear(now);
    calendar.querySelectorAll('.door').forEach((door) => updateDoor(door, now));
    // Keep a currently playing story intact at an ordinary December midnight.
    // At the end of December, close it and restore all doors to closed.
    if (activeStoryDay !== null && !canOpenDoor(activeStoryDay, now)) closeModal();
  }

  // ----- Build doors -----
  for (const day of doorOrder) {
    // Native buttons support Tab, Enter, Space, clicks, and taps.
    // They remain enabled when locked so the explanatory popup still works.
    const door = document.createElement('button');
    door.type = 'button';
    door.classList.add('door');
    door.dataset.day = day;
    door.id = `door-${day}`;
    door.setAttribute('aria-haspopup', 'dialog');
    door.textContent = day;
    updateDoor(door, currentDate());

    door.addEventListener('click', () => {
      const existingPopup = document.querySelector('.locked-popup:not(.reset-confirm)');
      if (existingPopup) existingPopup.remove();
      // Recheck at activation, even if a phone delayed its background timer.
      const now = currentDate();
      useProgressForYear(now);
      updateDoor(door, now);
      if (!canOpenDoor(day, now)) {
        showLockedPopup(getLockedMessage());
        return;
      }
      const surprise = surprises[day - 1];
      if (!openedDoorsScoped.includes(day)) {
        openedDoorsScoped.push(day);
        writeSetting(openedDoorsKey, JSON.stringify(openedDoorsScoped));
        updateDoor(door, now);
        if (surprise.type !== 'youtube' && isSoundOn && hohoho) {
          hohoho.currentTime = 0;
          hohoho.play().catch(() => {});
        }
      }
      activeStoryDay = day;
      renderSurprise(surprise);
      openModal(door);
    });
    calendar.appendChild(door);
  }

  // One timeout to local midnight; no continuous polling or page reload.
  let midnightTimer;
  function scheduleMidnightCheck() {
    window.clearTimeout(midnightTimer);
    const now = currentDate();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnightTimer = window.setTimeout(() => {
      refreshDoorAvailability();
      scheduleMidnightCheck();
    }, next.getTime() - now.getTime() + 100);
  }
  function checkWhenReturning() {
    if (document.hidden) return;
    refreshDoorAvailability();
    scheduleMidnightCheck();
  }
  document.addEventListener('visibilitychange', checkWhenReturning);
  window.addEventListener('focus', checkWhenReturning);
  window.addEventListener('pageshow', checkWhenReturning);
  scheduleMidnightCheck();

  // ----- Reset -----
    // ----- Reset (accessible dialog) -----
  const resetButton = document.getElementById("resetButton");
  const resetDialog = document.getElementById("resetConfirm");
  const resetMsg = document.getElementById("resetConfirmMessage");
  const resetYes = document.getElementById("resetConfirmYes");
  const resetNo = document.getElementById("resetConfirmNo");

  let lastFocusedElement = null;
  let resetInertBackground = [];

  function openResetDialog() {
    if (!resetDialog) return;

    // Remember where focus was
    lastFocusedElement = document.activeElement;

    // Your custom message:
    const message = isGerman
      ? "Möchtest du den Kalender zurücksetzen und alle Türen wieder verpacken?\n\nDein Fortschritt auf diesem Gerät wird gelöscht."
      : "Do you want to reset the calendar and wrap all the doors back up?\n\nYour progress on this device will be cleared.";

    // Dialog title (optional customization)
    const title = isGerman
      ? "🎄 Kalender zurücksetzen?"
      : "🎄 Reset calendar?";

    // Set the text content
    const titleEl = document.getElementById("resetConfirmTitle");
    if (titleEl) titleEl.textContent = title;
    resetMsg.textContent = message;
    resetYes.textContent = isGerman ? "🎁 Zurücksetzen" : "🎁 Reset";
    resetNo.textContent = isGerman ? "Abbrechen" : "Cancel";

    // Show dialog
    resetDialog.classList.add("visible");
    resetDialog.setAttribute("aria-hidden", "false");

    // Like the story window: keyboard and screen readers stay in the
    // dialog until it closes. Restore each element's previous state later.
    resetInertBackground = Array.from(document.body.children)
      .filter((el) => el !== resetDialog)
      .map((el) => ({ el, wasInert: el.hasAttribute("inert") }));
    resetInertBackground.forEach(({ el }) => el.setAttribute("inert", ""));

    // Start on Cancel, so a stray Enter cannot clear anyone's progress
    resetNo.focus();

    // Enable ESC + focus trap
    document.addEventListener("keydown", handleResetKeydown);
  }

  function closeResetDialog() {
    if (!resetDialog) return;

    resetDialog.classList.remove("visible");
    resetDialog.setAttribute("aria-hidden", "true");

    document.removeEventListener("keydown", handleResetKeydown);

    resetInertBackground.forEach(({ el, wasInert }) => {
      if (!wasInert) el.removeAttribute("inert");
    });
    resetInertBackground = [];

    // Restore focus to the button that opened it
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function handleResetKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeResetDialog();
      return;
    }

    // Simple focus trap inside dialog
    if (e.key === "Tab" && resetDialog.classList.contains("visible")) {
      const focusable = [resetYes, resetNo].filter(Boolean);
      const currentIndex = focusable.indexOf(document.activeElement);

      if (e.shiftKey) {
        // Shift+Tab = backwards
        if (currentIndex <= 0) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      } else {
        // Tab = forwards
        if (currentIndex === focusable.length - 1) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    }
  }

  if (resetButton && resetDialog && resetYes && resetNo) {
    // Open dialog
    resetButton.addEventListener("click", () => {
      openResetDialog();
    });

    // Cancel button
    resetNo.addEventListener("click", () => {
      closeResetDialog();
    });

    // Confirm button
    resetYes.addEventListener("click", () => {
      // Clear calendar progress without relying on a reload or working storage.
      removeSetting('openedDoors');
      const keys = new Set([openedDoorsKey, ...sessionStorageFallback.keys()]);
      try { Object.keys(window.localStorage).forEach((key) => keys.add(key)); } catch {}
      keys.forEach((key) => {
        if (key.startsWith('openedDoors-')) removeSetting(key);
      });
      openedDoorsScoped = [];
      doorOrder = Array.from({ length: 24 }, (_, i) => i + 1);
      for (let i = doorOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [doorOrder[i], doorOrder[j]] = [doorOrder[j], doorOrder[i]];
      }
      writeSetting('doorOrder', JSON.stringify(doorOrder));
      doorOrder.forEach((day) => calendar.appendChild(document.getElementById(`door-${day}`)));
      closeResetDialog();
      refreshDoorAvailability();
    });

  }

  // ----- Auto-open via URL ?day=7 -----
  function autoOpenFromQuery() {
    const url = new URL(window.location.href);
    const paramDay = parseInt(url.searchParams.get("day"), 10);

    // If it's not a valid day number, do nothing
    if (!paramDay || paramDay < 1 || paramDay > 24) return;

    const doorToOpen = document.querySelector(`.door[data-day="${paramDay}"]`);
    if (!doorToOpen) return;

    // Optional: smooth scroll to the door
    doorToOpen.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add matching hash for nicer sharing (optional)
    history.replaceState(null, "", `?day=${paramDay}#door-${paramDay}`);

    refreshDoorAvailability();

    // If locked, show festive popup
    if (doorToOpen.dataset.locked === "true") {
      showLockedPopup(getLockedMessage());
      return;
    }

    // Otherwise: open it using your existing click logic
    doorToOpen.click();
  }

  // Run once on load
  autoOpenFromQuery();
});
