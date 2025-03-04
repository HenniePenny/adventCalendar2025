// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar"); // Reference to the calendar container
    const today = new Date(); // Get current date based on user's local time
    const currentDay = today.getDate(); // Extract the current day of the month (1-31)

    // Array of surprises (fixed to correspond with specific doors)
    const surprises = [
        "❄️ Winter has come!",  // Door 1
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
        }

        // Add a click event listener to the door
        door.addEventListener("click", () => {
            if (door.dataset.opened !== "true") {
                door.classList.add("opened"); // Mark door as opened
                door.innerHTML = surprises[day - 1]; // Show the surprise for the day
                openedDoors.push(day); // Add the day to the list of opened doors
                localStorage.setItem("openedDoors", JSON.stringify(openedDoors)); // Save the updated state to localStorage
                door.dataset.opened = "true"; // Mark as opened in dataset
            }
        });

        calendar.appendChild(door); // Add the door to the calendar container
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