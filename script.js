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

// ----- Date-gating config -----
const today = new Date();

// --- TEMPORARY: pretend today's date is Dec 10 for testing ---
today.setMonth(11);   // December (0-based)
today.setDate(10);

const targetYear = today.getFullYear();
const targetMonth = 11; // December

// ----- Testing mode -----
const FORCE_TESTING_MODE = false;
const autoTestingMode = today.getMonth() !== targetMonth; // now false
const testingMode = FORCE_TESTING_MODE || autoTestingMode; // false

  if (testingMode) {
    console.log(
      `🎁 Advent Calendar testing mode active — all doors unlocked for easy preview (${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}).`
    );
  }

  // ----- Date comparisons -----
  const currentDateMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const isTargetWindow = today.getFullYear() === targetYear && today.getMonth() === targetMonth;

  // ----- Local storage keys -----
  const openedDoorsKey = `openedDoors-${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
  const openedDoorsScoped = JSON.parse(localStorage.getItem(openedDoorsKey)) || [];

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

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    if (dialog) dialog.focus();
    document.addEventListener("keydown", onEsc);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
    modal.classList.remove("modal--media");
    document.removeEventListener("keydown", onEsc);
  }

  function onEsc(e) {
    if (e.key === "Escape") closeModal();
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  function renderSurprise(s) {
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
    }
  }

  // ----- Surprises -----
  const surprises = [
    { type: "image", src: "assets/surprises/berlin-sugar-love.png", alt: "Festive gingerbread hearts with Berlin Christmas market charm and sweet holiday love" },
    { type: "image", src: "assets/surprises/cozy-vibes.webp", alt: "Warm and cozy fireplace scene with steaming hot cocoa creating perfect winter comfort" },
    { type: "image", src: "assets/surprises/christmas_cat_santaclaws.webp", alt: "Adorable cat playfully peeking through decorated Christmas tree branches with festive curiosity" },
    { type: "image", src: "assets/surprises/spreading-christmas-cheer.webp", alt: "Charming toy car carrying a miniature Christmas tree on its roof, spreading holiday cheer" },
    { type: "image", src: "assets/surprises/chillin-snowmies.webp", alt: "Delightful snowman figurine surrounded by twinkling sparkling lights creating magical winter atmosphere" },
    { type: "youtube", url: "https://youtu.be/-5iG-Kmt1iY?si=js8pv0D-i2mpzd60", title: "Christmas Comes But Once a Year (1936, Fleischer Studios)" },
    { type: "youtube", url: "https://youtu.be/ve_sWSfX9uw?si=tZdqoWsx00XezlfN", title: "Rudolph the Red-Nosed Reindeer (Classic Cartoon)" },
    { type: "image", src: "assets/surprises/dreams-shine-brighter.png", alt: "Magnificent building facade at night with projected stars making dreams shine brighter during Christmas" },
    { type: "image", src: "assets/surprises/elf-esteem.webp", alt: "Festive elf-themed scene with holiday treats boosting Christmas elf-esteem and seasonal joy" },
    { type: "youtube", url: "https://youtu.be/yubLpbv0Vs4?si=JK_iwyDFm3opE5hu", title: "Jack Frost (1934, Ub Iwerks)" },
    { type: "image", src: "assets/surprises/one-toast-at-a-time.webp", alt: "Warm scene of sharing cookies with friends, one toast at a time during Christmas celebration" },
    { type: "image", src: "assets/surprises/ornaments.webp", alt: "Beautiful festive candles surrounded by elegant Christmas ornaments creating warm holiday ambiance" },
    { type: "image", src: "assets/surprises/no-reindeer-no-problem.webp", alt: "Unique snowflake patterns showing that like people, no reindeer needed when Christmas magic is everywhere" },
    { type: "youtube", url: "https://youtu.be/hYKde7ARvnU?si=OIllor6wmYVHnJMl", title: "A Christmas Visit (1959 Animated Short)" },
    { type: "youtube", url: "https://youtu.be/rHhTVZEGRaM?si=y1EVVqdZJtZYl-rQ", title: "Snow Foolin’ (1949, Famous Studios)" },
    { type: "image", src: "assets/surprises/peace-joy-sparkle.png", alt: "Peaceful Christmas message encouraging sending kind notes with sparkling joy and holiday spirit" },
    { type: "image", src: "assets/surprises/sip-sparkle-repeat.png", alt: "Sweet Christmas treats with sip, sparkle, and repeat vibes for perfect holiday indulgence" },
    { type: "image", src: "assets/surprises/tis-the-season.png", alt: "Classic Christmas bells jingling with festive cheer celebrating that tis the season to be jolly" },
    { type: "youtube", url: "https://youtu.be/wIPcrTnSpSQ?si=3Zr-3anQmMhQw4Dy", title: "The Pups’ Christmas (1936, Happy Harmonies)" },
    { type: "image", src: "assets/surprises/next-stop-magic.png", alt: "Festive music scene with Christmas tunes filling the air, next stop is pure holiday magic" },
    { type: "youtube", url: "https://youtu.be/zLhvCOOxH-Q?si=29fKBEUzsGHjk6bj", title: "Die Geschichte vom wahren Weihnachtsmann | NETTO" },
    { type: "youtube", url: "https://youtu.be/tl57Gy5X_Kg?si=ozd2m4o7Fmv1KIbc", title: "From Our Family To Yours | Disney Christmas Advert (2020)" },
    { type: "image", src: "assets/surprises/santa-wants-extras.webp", alt: "Heartwarming scene of spreading Christmas cheer with Santa wanting extra holiday love and joy" },
    { type: "image", src: "assets/surprises/sugar-glue-dreams.webp", alt: "Cozy Christmas moment with warm drink creating sugar-sweet dreams by the fireplace" },
  ];

  // ----- Locked message -----
  function getLockedMessage() {
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang && userLang.toLowerCase().startsWith("de");
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
  if (localStorage.getItem("soundEnabled") === "true") {
    isSoundOn = true;
    toggleLabel.querySelector("#soundToggle").checked = true;
  }
  toggleLabel.querySelector("#soundToggle").addEventListener("change", (e) => {
    isSoundOn = e.target.checked;
    localStorage.setItem("soundEnabled", isSoundOn);
  });

  // ----- Door order -----
  let doorOrder = JSON.parse(localStorage.getItem("doorOrder"));
  if (!doorOrder) {
    doorOrder = Array.from({ length: 24 }, (_, i) => i + 1);
    for (let i = doorOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doorOrder[i], doorOrder[j]] = [doorOrder[j], doorOrder[i]];
    }
    localStorage.setItem("doorOrder", JSON.stringify(doorOrder));
  }

  // ----- Build doors -----
  for (const day of doorOrder) {
    const door = document.createElement("div");
    door.classList.add("door");
    door.setAttribute("data-day", day);

    const unlockDateMs = new Date(targetYear, targetMonth, day).setHours(0, 0, 0, 0);

    if (openedDoorsScoped.includes(day)) {
      door.classList.add("opened");
      renderDoorPreview(door, surprises[day - 1]);
      door.dataset.opened = "true";
    } else {
      door.textContent = day;
      const shouldLock = !testingMode && (!isTargetWindow || currentDateMs < unlockDateMs);
      if (shouldLock) {
        door.classList.add("locked");
        door.dataset.locked = "true";
      }
    }

    door.addEventListener("click", () => {
      if (door.dataset.locked === "true") {
        alert(getLockedMessage());
        return;
      }

      const surprise = surprises[day - 1];

      if (door.dataset.opened !== "true") {
        door.classList.add("opened");
        renderDoorPreview(door, surprise);
        openedDoorsScoped.push(day);
        localStorage.setItem(openedDoorsKey, JSON.stringify(openedDoorsScoped));
        door.dataset.opened = "true";

        if (surprise.type !== "youtube" && isSoundOn && hohoho) {
          hohoho.currentTime = 0;
          hohoho.play().catch((err) => console.log("Audio playback failed:", err));
        }
      }

      renderSurprise(surprise);
      openModal();
    });

    calendar.appendChild(door);
  }

  // ----- Reset -----
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      localStorage.removeItem("openedDoors");
      localStorage.removeItem("doorOrder");
      localStorage.removeItem(openedDoorsKey);
      location.reload();
    });
  }
});
