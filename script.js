// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Detect touch support and add a class to <body>
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
        console.log("Touch device detected – .touch-device class added.");
    }

    // Initialize variables, point at the universal modal added in HTML
    const calendar = document.getElementById("calendar"); // Reference to the calendar container
    const modal = document.getElementById("surpriseModal");
    const dialog = modal.querySelector(".modal-dialog");
    const modalBody = document.getElementById("modalBody");

    const today = new Date(); // Get current date based on user's local time
    const currentDay = today.getDate(); // Extract the current day of the month (1-31)

    // --- Universal helpers ---
function getYouTubeId(input) {
  if (!input) return null;
  // raw ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const u = new URL(input);
    const host = u.hostname.replace(/^www\./, "");
    // youtu.be/<id>
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0];
    // youtube.com/watch?v=<id>
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
      // youtube.com/embed/<id>
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
      // youtube.com/shorts/<id>
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || u.pathname.split("/")[1];
    }
  } catch {}
  return null;
}

    function openModal() {
    modal.setAttribute("aria-hidden", "false");
    // focus the dialog for a11y (requires tabindex="-1" on .modal-dialog)
    if (dialog) dialog.focus();
    document.addEventListener("keydown", onEsc);
    }

    function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = ""; // clear (stops any video too)
    document.removeEventListener("keydown", onEsc);
    }

    function onEsc(e) {
    if (e.key === "Escape") closeModal();
    }

    // Click outside or on any [data-close] element closes modal
    modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) {
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
        const img = document.createElement("img");
        img.src = s.src; img.alt = s.alt || ""; img.loading = "lazy";
        modalBody.appendChild(img);
        break;
        }
        case "text": {
        const wrap = document.createElement("div");
        wrap.className = "modal-text";
        if (s.title) {
            const h = document.createElement("h3");
            h.textContent = s.title; wrap.appendChild(h);
        }
        const p = document.createElement("p");
        p.textContent = s.body || ""; wrap.appendChild(p);
        modalBody.appendChild(wrap);
        break;
        }
        case "youtube": {
        const id = getYouTubeId(s.url || s.id);
        if (!id) { modalBody.textContent = "Video unavailable."; break; }
        const box = document.createElement("div"); box.className = "modal-video";
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true; iframe.title = s.title || "Video";
        box.appendChild(iframe); modalBody.appendChild(box);
        break;
        }
        default:
        modalBody.textContent = "Unknown surprise type.";
    }
    }

    // Optional: render a compact preview inside the door itself
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

    // Surprises array (1 per door, in order).
    // Each surprise is an object with a `type` and related fields:
    //
    // Supported types:
    // - { type: "image", src: "...", alt: "..." }
    // - { type: "text", title?: "...", body: "..." }
    // - { type: "youtube", url: "https://youtu.be/..." }
    //
    // This makes it easy to handle images, text, or videos
    // in the same modal by checking surprise.type.
    const surprises = [
    { type: "image", src: "assets/surprises/berlin-sugar-love.png", alt: "Festive gingerbread hearts with Berlin Christmas market charm and sweet holiday love" }, // Door 1
    { type: "image", src: "assets/surprises/cozy-vibes.webp", alt: "Warm and cozy fireplace scene with steaming hot cocoa creating perfect winter comfort" }, // Door 2
    { type: "image", src: "assets/surprises/christmas_cat_santaclaws.webp", alt: "Adorable cat playfully peeking through decorated Christmas tree branches with festive curiosity" }, // Door 3
    { type: "image", src: "assets/surprises/spreading-christmas-cheer.webp", alt: "Charming toy car carrying a miniature Christmas tree on its roof, spreading holiday cheer" }, // Door 4
    { type: "image", src: "assets/surprises/chillin-snowmies.webp", alt: "Delightful snowman figurine surrounded by twinkling sparkling lights creating magical winter atmosphere" }, // Door 5
    { type: "image", src: "assets/surprises/powered-by-sugar.webp", alt: "Tempting pile of glossy candied apples glistening with sweet sugar coating and holiday indulgence" }, // Door 6
    { type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Holiday vibes 🎄" }, // Door 7
    { type: "image", src: "assets/surprises/dreams-shine-brighter.png", alt: "Magnificent building facade at night with projected stars making dreams shine brighter during Christmas" }, // Door 8
    { type: "image", src: "assets/surprises/elf-esteem.webp", alt: "Festive elf-themed scene with holiday treats boosting Christmas elf-esteem and seasonal joy" }, // Door 9
    { type: "image", src: "assets/surprises/history-hope-sparkle.png", alt: "Sparkling Christmas lights creating hope and making your days merry with festive magic" }, // Door 10
    { type: "image", src: "assets/surprises/one-toast-at-a-time.webp", alt: "Warm scene of sharing cookies with friends, one toast at a time during Christmas celebration" }, // Door 11
    { type: "image", src: "assets/surprises/ornaments.webp", alt: "Beautiful festive candles surrounded by elegant Christmas ornaments creating warm holiday ambiance" }, // Door 12
    { type: "image", src: "assets/surprises/no-reindeer-no-problem.webp", alt: "Unique snowflake patterns showing that like people, no reindeer needed when Christmas magic is everywhere" }, // Door 13
    { type: "image", src: "assets/surprises/joy-in-motion.png", alt: "Joyful celebration scene with family and friends sharing Christmas happiness in motion" }, // Door 14
    { type: "image", src: "assets/surprises/standing-tall-shining.png", alt: "Magnificent shining Christmas star standing tall to guide your way through the holidays" }, // Door 15
    { type: "image", src: "assets/surprises/peace-joy-sparkle.png", alt: "Peaceful Christmas message encouraging sending kind notes with sparkling joy and holiday spirit" }, // Door 16
    { type: "image", src: "assets/surprises/sip-sparkle-repeat.png", alt: "Sweet Christmas treats with sip, sparkle, and repeat vibes for perfect holiday indulgence" }, // Door 17
    { type: "image", src: "assets/surprises/tis-the-season.png", alt: "Classic Christmas bells jingling with festive cheer celebrating that tis the season to be jolly" }, // Door 18
    { type: "image", src: "assets/surprises/storybook-christmas.png", alt: "Magical storybook Christmas scene perfect for reading enchanting holiday tales by the fire" }, // Door 19
    { type: "image", src: "assets/surprises/next-stop-magic.png", alt: "Festive music scene with Christmas tunes filling the air, next stop is pure holiday magic" }, // Door 20
    { type: "image", src: "assets/surprises/rising-joy-Berlin-style.png", alt: "Mini holiday party celebration with Berlin-style rising joy and festive atmosphere throughout the city" }, // Door 21
    { type: "image", src: "assets/surprises/path-to-cheer.png", alt: "Beautiful winter walk scene showing the scenic path to Christmas cheer through snowy landscapes" }, // Door 22
    { type: "image", src: "assets/surprises/santa-wants-extras.webp", alt: "Heartwarming scene of spreading Christmas cheer with Santa wanting extra holiday love and joy" }, // Door 23
    { type: "image", src: "assets/surprises/sugar-glue-dreams.webp", alt: "Cozy Christmas moment with warm drink creating sugar-sweet dreams by the fireplace" } // Door 24
    ];

    // Retrieve the list of opened doors from localStorage (or initialize as an empty array)
    // If 'openedDoors' exists, it retrieves the stored array; otherwise, it defaults to []
    // The localStorage entry is created the first time a door is opened and saved.
    const openedDoors = JSON.parse(localStorage.getItem("openedDoors")) || [];

    // Sound setup (desktop-only)
    const isDesktop = window.matchMedia("(min-width: 768px)").matches &&
                      window.matchMedia("(pointer: fine)").matches;

    let isSoundOn = false;
    let hohoho;

    if (isDesktop) {
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

        toggleLabel.querySelector("#soundToggle").addEventListener("change", (e) => {
            isSoundOn = e.target.checked;
            localStorage.setItem("soundEnabled", isSoundOn);
        });
    }

    // Create doors dynamically in fixed order (1-24)
    for (let day = 1; day <= 24; day++) {
        const door = document.createElement("div"); // Create a door element
        door.classList.add("door"); // Add the "door" class
        door.setAttribute("data-day", day); // Set the day as a custom attribute

        // Check if the door has already been opened
        if (openedDoors.includes(day)) {
            door.classList.add("opened");
            renderDoorPreview(door, surprises[day - 1]);
            door.dataset.opened = "true"; // Store opened state in dataset
        } else {
            door.textContent = day; // Display the door number

            // Lock future doors (cannot be clicked until their day)
            if (day > currentDay) {
                door.classList.add("locked"); // Add locked styling
                door.dataset.locked = "true"; // Mark door as locked
            }
        }

// Add a click event listener to the door
door.addEventListener("click", () => {
    if (door.dataset.locked === "true") {
        alert("🔒🎄 Locked! Open this door on the correct day.");
        return;
    }

    const surprise = surprises[day - 1];

    // First-time open: mark and preview + save state
    if (door.dataset.opened !== "true") {
        door.classList.add("opened");
        renderDoorPreview(door, surprise);

        openedDoors.push(day);
        localStorage.setItem("openedDoors", JSON.stringify(openedDoors));
        door.dataset.opened = "true";

        // Play sound if enabled
        if (isDesktop && isSoundOn && hohoho) {
            hohoho.currentTime = 0;
            hohoho.play().catch(err => console.log("Audio playback failed:", err));
        }
    }

    // Always open the universal modal (first time and subsequent clicks)
    renderSurprise(surprise);
    openModal();
});

        calendar.appendChild(door);
    }
});

// Reset button to clear opened doors and refresh the page
const resetButton = document.getElementById("resetButton");
if (resetButton) {
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("openedDoors"); // Clear saved state in localStorage
        location.reload(); // Refresh the page
    });
}