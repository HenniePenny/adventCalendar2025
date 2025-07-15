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
        '<img src="assets/santa_over_berlin.webp" alt="Santa flying over Berlin at night" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem;" />',  // Door 1
        "🎄 Deck the halls!",   // Door 2
        "🎁 Enjoy a hot chocolate!", // Door 3
        "🌟 Believe in the magic of Christmas!", // Door 4
        "🎅 Santa is on his way!", // Door 5
        "🎀 Wrap up some gifts!", // Door 6
        "☃️ Build a snowman today!", // Door 7
        "🎵 Sing your favorite carol!", // Door 8
        "🦌 Rudolph is ready to fly!", // Door 9
        "✨ May your days be merry!", // Door 10
        "🍪 Share some cookies with a friend!", // Door 11
        "🕯️ Light a festive candle!", // Door 12
        "❄️ Snowflakes are unique, just like you!", // Door 13
        "🎉 Celebrate with family and friends!", // Door 14
        "🌟 A shining star to guide your way!", // Door 15
        "💌 Send a kind note to someone!", // Door 16
        "🍬 Enjoy a sweet treat!", // Door 17
        "🔔 Jingle bells, jingle bells!", // Door 18
        "📖 Read a holiday story!", // Door 19
        "🎶 Listen to festive tunes!", // Door 20
        "🎊 Throw a mini holiday party!", // Door 21
        "🌲 Go for a winter walk!", // Door 22
        "💖 Spread holiday cheer!", // Door 23
        "☕ Cozy up with a warm drink!" // Door 24
    ];

    // Retrieve the list of opened doors from localStorage (or initialize as an empty array)
    // If 'openedDoors' exists, it retrieves the stored array; otherwise, it defaults to []
    // The localStorage entry is created the first time a door is opened and saved.
    const openedDoors = JSON.parse(localStorage.getItem("openedDoors")) || [];

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
        door.addEventListener("click", () => {
            if (door.dataset.locked === "true") {
                alert("🔒🎄 Locked! Open this door on the correct day.");
                return;
            }
            if (door.dataset.opened !== "true") {
                door.classList.add("opened");
                const content = surprises[day - 1];
                door.innerHTML = content;
                openedDoors.push(day);
                localStorage.setItem("openedDoors", JSON.stringify(openedDoors));
                door.dataset.opened = "true";

                // 👉 NEW: Trigger modal popup immediately if content contains an image
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