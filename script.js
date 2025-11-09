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

  // ----- Date-gating config (future-proof and public-friendly) -----
  const today = new Date();

  /**
   * 🎄 Automatically set the target month and year
   * 
   * - December (month index 11) is the “official” advent calendar period.
   * - The year always matches the current year automatically.
   * - No need to update this file each year — it will stay current forever.
   */
  const targetYear = today.getFullYear();
  const targetMonth = 11; // 0-based: 11 = December

  /**
   * 🧩 Developer testing mode
   * 
   * - When TRUE, all doors remain unlocked regardless of date.
   * - Automatically enabled when it’s *not* December.
   * - Anyone can force it manually by setting FORCE_TESTING_MODE = true.
   */
  const FORCE_TESTING_MODE = false;
  const autoTestingMode = today.getMonth() !== targetMonth;
  const testingMode = FORCE_TESTING_MODE || autoTestingMode;

  if (testingMode) {
    console.log(
      `🎁 Advent Calendar testing mode active — all doors unlocked for easy preview (${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}).`
    );
  }

  /**
   * 📅 Normalize today’s date to midnight (no hours/minutes)
   * Used for comparing against each door’s unlock date.
   */
  const currentDateMs = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  /**
   * 🎅 Check if we’re in the correct calendar window (December of target year)
   * Used to manage locking behavior when testing mode is off.
   */
  const isTargetWindow =
    today.getFullYear() === targetYear && today.getMonth() === targetMonth;

  /**
   * 🔑 Create a scoped localStorage key for this specific calendar run
   * Ensures that progress doesn’t mix between months or years.
   * Example: openedDoors-2025-12
   */
  const openedDoorsKey = `openedDoors-${targetYear}-${String(
    targetMonth + 1
  ).padStart(2, "0")}`;

  /**
   * 🎁 Retrieve any previously opened doors for this calendar instance
   * (So that user progress is remembered between reloads)
   */
  const openedDoorsScoped =
    JSON.parse(localStorage.getItem(openedDoorsKey)) || [];

  // 🪄 Optional: Visible badge for testing mode (appears in bottom-right corner)
  if (testingMode) {
    const badge = document.createElement("div");
    badge.textContent = "🧪 Testing Mode Active – All Doors Unlocked";
    badge.style.position = "fixed";
    badge.style.bottom = "0.75rem";
    badge.style.right = "0.75rem";
    badge.style.background = "rgba(46, 139, 87, 0.9)";
    badge.style.color = "#fff";
    badge.style.fontSize = "0.9rem";
    badge.style.fontFamily = "system-ui, sans-serif";
    badge.style.padding = "0.4rem 0.75rem";
    badge.style.borderRadius = "0.5rem";
    badge.style.zIndex = "9999";
    badge.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
    badge.style.pointerEvents = "none"; // ensure clicks pass through
    document.body.appendChild(badge);
  }
  
  // ----- Helpers -----
  function getYouTubeId(input) {
    if (!input) return null;
    // raw ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.slice(1).split("/")[0];
      if (
        host === "youtube.com" ||
        host === "m.youtube.com" ||
        host === "youtube-nocookie.com"
      ) {
        if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
        if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
        if (u.pathname.startsWith("/shorts/"))
          return u.pathname.split("/")[2] || u.pathname.split("/")[1];
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
    modalBody.innerHTML = ""; // clear (also stops any iframe/video)
    modal.classList.remove("modal--media");
    document.removeEventListener("keydown", onEsc);
  }

  function onEsc(e) {
    if (e.key === "Escape") closeModal();
  }

  // Click outside or any [data-close] closes modal
  modal.addEventListener("click", (e) => {
    if (
      e.target.closest("[data-close]") ||
      e.target.classList.contains("modal-backdrop")
    ) {
      closeModal();
    }
  });

  // Render full surprise into the modal body
  function renderSurprise(s) {
    modalBody.innerHTML = "";
    if (!s || !s.type) {
      modalBody.textContent = "Nothing here yet. Come back later!";
      return;
    }
    switch (s.type) {
      case "image": {
        modal.classList.add("modal--media");
        const img = document.createElement("img");
        img.src = s.src;
        img.alt = s.alt || "";
        img.loading = "lazy";
        modalBody.appendChild(img);
        break;
      }
      case "text": {
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
      }
      case "youtube": {
        modal.classList.add("modal--media");

        const id = getYouTubeId(s.url || s.id);
        if (!id) {
          modalBody.textContent = "Video unavailable.";
          break;
        }

        // Pause hohoho if it's playing (avoid audio clash)
        if (hohoho && !hohoho.paused) {
          try {
            hohoho.pause();
          } catch {}
        }

        const box = document.createElement("div");
        box.className = "modal-video";

        const iframe = document.createElement("iframe");
        const base = `https://www.youtube.com/embed/${id}`;
        const params = new URLSearchParams({
          autoplay: "0", // start not autoplayed to avoid blockers
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          enablejsapi: "1",
          origin: location.origin,
        });
        iframe.src = `${base}?${params.toString()}`;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.title = s.title || "Video";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        box.appendChild(iframe);
        modalBody.appendChild(box);
        break;
      }
      default:
        modalBody.textContent = "Unknown surprise type.";
    }
  }

  // Compact preview inside the door
  function renderDoorPreview(doorEl, s) {
    if (!s) return;
    if (s.type === "image") {
      doorEl.innerHTML = `<img src="${s.src}" alt="${
        s.alt || ""
      }" loading="lazy" style="max-width:100%;height:auto;border-radius:.5rem">`;
    } else if (s.type === "text") {
      doorEl.innerHTML = `<div class="door-text" style="padding:.25rem .5rem;font-size:.9rem;line-height:1.3">${
        s.title || s.body || "Text"
      }</div>`;
    } else if (s.type === "youtube") {
      doorEl.innerHTML = `<div class="door-video" style="font-size:.9rem">▶ ${
        s.title || "Watch video"
      }</div>`;
    }
  }

  // ----- Surprises -----
const surprises = [
  { type: "image", src: "assets/surprises/berlin-sugar-love.png", alt: "Festive gingerbread hearts with Berlin Christmas market charm and sweet holiday love" }, // 1
  { type: "image", src: "assets/surprises/cozy-vibes.webp", alt: "Warm and cozy fireplace scene with steaming hot cocoa creating perfect winter comfort" }, // 2
  { type: "image", src: "assets/surprises/christmas_cat_santaclaws.webp", alt: "Adorable cat playfully peeking through decorated Christmas tree branches with festive curiosity" }, // 3
  { type: "image", src: "assets/surprises/spreading-christmas-cheer.webp", alt: "Charming toy car carrying a miniature Christmas tree on its roof, spreading holiday cheer" }, // 4
  { type: "image", src: "assets/surprises/chillin-snowmies.webp", alt: "Delightful snowman figurine surrounded by twinkling sparkling lights creating magical winter atmosphere" }, // 5
  { type: "youtube", url: "https://youtu.be/-5iG-Kmt1iY?si=js8pv0D-i2mpzd60", title: "Christmas Comes But Once a Year (1936, Fleischer Studios)" }, // 6 🎥
  { type: "youtube", url: "https://youtu.be/ve_sWSfX9uw?si=tZdqoWsx00XezlfN", title: "Rudolph the Red-Nosed Reindeer (Classic Cartoon)" }, // 7 🎥
  { type: "image", src: "assets/surprises/dreams-shine-brighter.png", alt: "Magnificent building facade at night with projected stars making dreams shine brighter during Christmas" }, // 8
  { type: "image", src: "assets/surprises/elf-esteem.webp", alt: "Festive elf-themed scene with holiday treats boosting Christmas elf-esteem and seasonal joy" }, // 9
  { type: "youtube", url: "https://youtu.be/yubLpbv0Vs4?si=JK_iwyDFm3opE5hu", title: "Jack Frost (1934, Ub Iwerks)" }, // 10 🎥
  { type: "image", src: "assets/surprises/one-toast-at-a-time.webp", alt: "Warm scene of sharing cookies with friends, one toast at a time during Christmas celebration" }, // 11
  { type: "image", src: "assets/surprises/ornaments.webp", alt: "Beautiful festive candles surrounded by elegant Christmas ornaments creating warm holiday ambiance" }, // 12
  { type: "image", src: "assets/surprises/no-reindeer-no-problem.webp", alt: "Unique snowflake patterns showing that like people, no reindeer needed when Christmas magic is everywhere" }, // 13
  { type: "youtube", url: "https://youtu.be/hYKde7ARvnU?si=OIllor6wmYVHnJMl", title: "A Christmas Visit (1959 Animated Short)" }, // 14 🎥
  { type: "youtube", url: "https://youtu.be/rHhTVZEGRaM?si=y1EVVqdZJtZYl-rQ", title: "Snow Foolin’ (1949, Famous Studios)" }, // 15 🎥
  { type: "image", src: "assets/surprises/peace-joy-sparkle.png", alt: "Peaceful Christmas message encouraging sending kind notes with sparkling joy and holiday spirit" }, // 16
  { type: "image", src: "assets/surprises/sip-sparkle-repeat.png", alt: "Sweet Christmas treats with sip, sparkle, and repeat vibes for perfect holiday indulgence" }, // 17
  { type: "image", src: "assets/surprises/tis-the-season.png", alt: "Classic Christmas bells jingling with festive cheer celebrating that tis the season to be jolly" }, // 18
  { type: "youtube", url: "https://youtu.be/wIPcrTnSpSQ?si=3Zr-3anQmMhQw4Dy", title: "The Pups’ Christmas (1936, Happy Harmonies)" }, // 19 🎥
  { type: "image", src: "assets/surprises/next-stop-magic.png", alt: "Festive music scene with Christmas tunes filling the air, next stop is pure holiday magic" }, // 20
  { type: "youtube", url: "https://youtu.be/zLhvCOOxH-Q?si=29fKBEUzsGHjk6bj", title: "Die Geschichte vom wahren Weihnachtsmann | NETTO" }, // 21 🎥
  { type: "youtube", url: "https://youtu.be/tl57Gy5X_Kg?si=ozd2m4o7Fmv1KIbc", title: "From Our Family To Yours | Disney Christmas Advert (2020)" }, // 22 🎥
  { type: "image", src: "assets/surprises/santa-wants-extras.webp", alt: "Heartwarming scene of spreading Christmas cheer with Santa wanting extra holiday love and joy" }, // 23
  { type: "image", src: "assets/surprises/sugar-glue-dreams.webp", alt: "Cozy Christmas moment with warm drink creating sugar-sweet dreams by the fireplace" }, // 24
];

// ----- Multilingual "locked door" messages -----
function getLockedMessage() {
const userLang = navigator.language || navigator.userLanguage;
const isGerman = userLang && userLang.toLowerCase().startsWith("de");


const messages = isGerman
? [
"Geduld, kleiner Wichtel! Diese Tür öffnet sich erst, wenn die Weihnachtsmagie bereit ist.",
"Hoppla! Selbst der Weihnachtsmann darf nicht vorher gucken 🎅.",
"Netter Versuch – aber diese Tür wickelt noch ihr Geheimnis ein 🎁.",
"Zu früh! Die Wichtel sind noch mitten im Plätzchenbacken 🍪.",
"Immer langsam mt den jungen Rentieren! Diese Tür braucht noch einen Moment 🦌.",
"Diese Tür steht noch auf der Liste der unartigen Kinder – schau später nochmal vorbei 😜.",
"🎄 Die Zukunft ist festlich… aber *heute* noch nicht. Komm später wieder!",
"Der Weihnachtsmann prüft hier noch einmal alles ganz genau – versuch’s am richtigen Tag nochmal!"
]
: [
"Patience, little elf! This door opens when the Christmas magic says so.",
"Whoa there! Even Santa can’t peek early 🎅.",
"Nice try, but this door’s still wrapping its surprise! 🎁",
"Too early! The elves are still baking today’s cookies 🍪.",
"Hold your reindeer! This door isn’t ready yet 🦌.",
"This one’s still on the naughty list — check back later! 😜",
"🎄 The future is festive… but not *today*. Come back later!",
"Santa’s still double-checking this one. Try again on the right day!"
];


return messages[Math.floor(Math.random() * messages.length)];
}

  // ----- Sound (all devices) -----
  let isSoundOn = false;
  let hohoho;

  hohoho = new Audio("assets/hohoho.mp3");

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

  toggleLabel
    .querySelector("#soundToggle")
    .addEventListener("change", (e) => {
      isSoundOn = e.target.checked;
      localStorage.setItem("soundEnabled", isSoundOn);
    });


// Generate a fixed random order of doors (saved once in localStorage)
let doorOrder = JSON.parse(localStorage.getItem("doorOrder"));

if (!doorOrder) {
  // Create array [1, 2, ..., 24]
  doorOrder = Array.from({ length: 24 }, (_, i) => i + 1);

  // Fisher–Yates shuffle
  for (let i = doorOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doorOrder[i], doorOrder[j]] = [doorOrder[j], doorOrder[i]];
  }

  // Save it so the order stays the same across reloads
  localStorage.setItem("doorOrder", JSON.stringify(doorOrder));
}


  // ----- Build doors -----
  for (const day of doorOrder) {
    const door = document.createElement("div");
    door.classList.add("door");
    door.setAttribute("data-day", day);

    // Unlock timestamp (midnight local) for this door in the target month/year
    const unlockDateMs = new Date(targetYear, targetMonth, day).setHours(
      0,
      0,
      0,
      0
    );

    if (openedDoorsScoped.includes(day)) {
      // Already opened
      door.classList.add("opened");
      renderDoorPreview(door, surprises[day - 1]); // compact preview
      door.dataset.opened = "true";
    } else {
      door.textContent = day;

     // Lock outside window OR before unlock date
      const shouldLock = !isTargetWindow || currentDateMs < unlockDateMs;
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

      // First-time open: mark, preview, persist
      if (door.dataset.opened !== "true") {
        door.classList.add("opened");
        renderDoorPreview(door, surprise);
        openedDoorsScoped.push(day);
        localStorage.setItem(openedDoorsKey, JSON.stringify(openedDoorsScoped));
        door.dataset.opened = "true";

        // Play sound if enabled (but not for YouTube to avoid clashing)
        if (surprise.type !== "youtube" && isSoundOn && hohoho) {
          hohoho.currentTime = 0;
          hohoho
            .play()
            .catch((err) => console.log("Audio playback failed:", err));
        }
      }

      // Open the universal modal for any content type
      renderSurprise(surprise);
      openModal();
    });

    calendar.appendChild(door);
  }

  // ----- Reset -----
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("openedDoors"); // legacy key (if present)
        localStorage.removeItem("doorOrder");   // remove the saved random layout
        localStorage.removeItem(openedDoorsKey); // remove the current scoped key
        location.reload();                      // reload page to redraw everything
    });
  }
});
