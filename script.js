// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Detect touch support and add a class to <body>
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
        console.log("Touch device detected – .touch-device class added.");
    }

    const calendar = document.getElementById("calendar"); // Reference to the calendar container
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const today = new Date(); // Get current date based on user's local time
    const currentDay = today.getDate(); // Extract the current day of the month (1-31)

    // Array of surprises (fixed to correspond with specific doors)
    const surprises = [
        '<img src="assets/surprises/berlin-sugar-love.png" alt="Festive gingerbread hearts with Berlin Christmas market charm and sweet holiday love" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;" />',  // Door 1
        '<img src="assets/surprises/cozy-vibes.webp" alt="Warm and cozy fireplace scene with steaming hot cocoa creating perfect winter comfort" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>',   // Door 2
        '<img src="assets/surprises/christmas_cat_santaclaws.webp" alt="Adorable cat playfully peeking through decorated Christmas tree branches with festive curiosity" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 3
        '<img src="assets/surprises/spreading-christmas-cheer.webp" alt="Charming toy car carrying a miniature Christmas tree on its roof, spreading holiday cheer" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 4
        '<img src="assets/surprises/chillin-snowmies.webp" alt="Delightful snowman figurine surrounded by twinkling sparkling lights creating magical winter atmosphere" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 5
        '<img src="assets/surprises/powered-by-sugar.webp" alt="Tempting pile of glossy candied apples glistening with sweet sugar coating and holiday indulgence" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 6
        '<img src="assets/surprises/carols-echo-in-square.png" alt="Enchanting Gendarmenmarkt Christmas market illuminated at night with carols echoing through the historic square" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 7
        '<img src="assets/surprises/dreams-shine-brighter.png" alt="Magnificent building facade at night with projected stars making dreams shine brighter during Christmas" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 8
        '<img src="assets/surprises/elf-esteem.webp" alt="Festive elf-themed scene with holiday treats boosting Christmas elf-esteem and seasonal joy" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 9
        '<img src="assets/surprises/history-hope-sparkle.png" alt="Sparkling Christmas lights creating hope and making your days merry with festive magic" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 10
        '<img src="assets/surprises/one-toast-at-a-time.webp" alt="Warm scene of sharing cookies with friends, one toast at a time during Christmas celebration" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 11
        '<img src="assets/surprises/ornaments.webp" alt="Beautiful festive candles surrounded by elegant Christmas ornaments creating warm holiday ambiance" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 12
        '<img src="assets/surprises/no-reindeer-no-problem.webp" alt="Unique snowflake patterns showing that like people, no reindeer needed when Christmas magic is everywhere" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 13
        '<img src="assets/surprises/joy-in-motion.png" alt="Joyful celebration scene with family and friends sharing Christmas happiness in motion" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 14
        '<img src="assets/surprises/standing-tall-shining.png" alt="Magnificent shining Christmas star standing tall to guide your way through the holidays" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 15
        '<img src="assets/surprises/peace-joy-sparkle.png" alt="Peaceful Christmas message encouraging sending kind notes with sparkling joy and holiday spirit" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 16
        '<img src="assets/surprises/sip-sparkle-repeat.png" alt="Sweet Christmas treats with sip, sparkle, and repeat vibes for perfect holiday indulgence" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 17
        '<img src="assets/surprises/tis-the-season.png" alt="Classic Christmas bells jingling with festive cheer celebrating that tis the season to be jolly" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 18
        '<img src="assets/surprises/storybook-christmas.png" alt="Magical storybook Christmas scene perfect for reading enchanting holiday tales by the fire" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 19
        '<img src="assets/surprises/next-stop-magic.png" alt="Festive music scene with Christmas tunes filling the air, next stop is pure holiday magic" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 20
        '<img src="assets/surprises/rising-joy-Berlin-style.png" alt="Mini holiday party celebration with Berlin-style rising joy and festive atmosphere throughout the city" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 21
        '<img src="assets/surprises/path-to-cheer.png" alt="Beautiful winter walk scene showing the scenic path to Christmas cheer through snowy landscapes" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 22
        '<img src="assets/surprises/santa-wants-extras.webp" alt="Heartwarming scene of spreading Christmas cheer with Santa wanting extra holiday love and joy" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>', // Door 23
        '<img src="assets/surprises/sugar-glue-dreams.webp" alt="Cozy Christmas moment with warm drink creating sugar-sweet dreams by the fireplace" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;"/>' // Door 24
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
            door.innerHTML = surprises[day - 1]; // Use fixed index to display the surprise
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
       // Add a click event listener to the door
door.addEventListener("click", () => {
    if (door.dataset.locked === "true") {
        alert("🔒🎄 Locked! Open this door on the correct day.");
        return;
    }

    if (door.dataset.opened !== "true") {
        door.classList.add("opened"); // Mark door as opened
        const content = surprises[day - 1];
        door.innerHTML = content; // Show the surprise for the day
        openedDoors.push(day); // Add the day to the list of opened doors
        localStorage.setItem("openedDoors", JSON.stringify(openedDoors)); // Save the updated state to localStorage
        door.dataset.opened = "true"; // Mark as opened in dataset

        // Play sound if enabled
        if (isDesktop && isSoundOn && hohoho) {
            hohoho.currentTime = 0;
            hohoho.play().catch(err => console.log("Audio playback failed:", err));
        }

        // Trigger modal popup immediately if content contains an image
        if (content.includes("<img")) {
            const temp = document.createElement("div");
            temp.innerHTML = content;
            const img = temp.querySelector("img");

            if (img) {
                modalImage.src = img.src;
                modalImage.alt = img.alt;
                modal.setAttribute("aria-hidden", "false");
                closeBtn.focus();
            }
        }
    }
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

/*************************************
 * IMAGE MODAL LOGIC
 * - Enlarges surprise images on click
 * - Touch-friendly and keyboard-accessible
 * - Opens full-size view in a popup (modal)
 * - Closes on ESC, overlay click, or button
 *************************************/
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeBtn = modal.querySelector(".modal-close");

  // Open modal when any image inside an opened door is clicked
document.getElementById("calendar").addEventListener("click", (e) => {
  const img = e.target;
  console.log("Click detected on:", e.target);
  if (img.tagName === "IMG" && img.closest(".door.opened")) {
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  }
});

  // Close modal
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
