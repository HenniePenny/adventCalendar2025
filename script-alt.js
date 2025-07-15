// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Detect touch support and add a class to <body>
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
        console.log("Touch device detected – .touch-device class added.");
    }

    const calendar = document.getElementById("calendar");
    const today = new Date();
    const currentDay = today.getDate();

    const surprises = [ /* your 24 messages here... */ ];

    const openedDoors = JSON.parse(localStorage.getItem("openedDoors")) || [];

    // 🔊 NEW: Sound setup (desktop-only)
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

    // 🎁 Create doors 1–24
    for (let day = 1; day <= 24; day++) {
        const door = document.createElement("div");
        door.classList.add("door");
        door.setAttribute("data-day", day);

        if (openedDoors.includes(day)) {
            door.classList.add("opened");
            door.innerHTML = surprises[day - 1];
            door.dataset.opened = "true";
        } else {
            door.textContent = day;
            if (day > currentDay) {
                door.classList.add("locked");
                door.dataset.locked = "true";
            }
        }

        door.addEventListener("click", () => {
            if (door.dataset.locked === "true") {
                alert("🔒🎄 Locked! Open this door on the correct day.");
                return;
            }
            if (door.dataset.opened !== "true") {
                door.classList.add("opened");
                door.innerHTML = surprises[day - 1];
                openedDoors.push(day);
                localStorage.setItem("openedDoors", JSON.stringify(openedDoors));
                door.dataset.opened = "true";

                // 🔊 Play sound if enabled
                if (isDesktop && isSoundOn && hohoho) {
                    hohoho.currentTime = 0;
                    hohoho.play().catch(err => console.log("Audio playback failed:", err));
                }
            }
        });

        calendar.appendChild(door);
    }
});

// 🔄 Reset button logic
const resetButton = document.getElementById("resetButton");
if (resetButton) {
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("openedDoors");
        location.reload();
    });
}
