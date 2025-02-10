// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar"); // Reference to the calendar container

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

    // Generate an array of numbers 1 to 24 and shuffle them for random door numbers
    const doorNumbers = Array.from({ length: 24 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    // Retrieve the list of opened doors from localStorage (or initialize it as an empty array)
    const openedDoors = JSON.parse(localStorage.getItem("openedDoors")) || [];

    // Create doors dynamically
    doorNumbers.forEach((day, index) => {
        const door = document.createElement("div"); // Create a door element
        door.classList.add("door"); // Add the "door" class
        door.setAttribute("data-day", day); // Set the day as a custom attribute

        // Check if the door has already been opened
        if (openedDoors.includes(day)) {
            door.classList.add("opened");
            door.innerHTML = surprises[index]; // Show the content
        } else {
            door.textContent = day; // Display the door number
        }

        // Add a click event listener to the door
        door.addEventListener("click", () => {
            if (!door.classList.contains("opened")) {
                door.classList.add("opened"); // Mark door as opened
                door.innerHTML = surprises[index]; // Show the surprise
                openedDoors.push(day); // Add the day to the list of opened doors
                localStorage.setItem("openedDoors", JSON.stringify(openedDoors)); // Save the updated state to localStorage
            }
        });

        calendar.appendChild(door); // Add the door to the calendar container
    });
});
document.getElementById("resetButton").addEventListener("click", () => {
    localStorage.removeItem("openedDoors"); // Clear saved doors
    location.reload(); // Refresh the page
});