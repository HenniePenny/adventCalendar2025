// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar"); // Reference to the calendar container

// Array of surprises (mix of text and images) for the doors
const surprises = [
    "❄️ Winter has come!",
    "🎄 Deck the halls!",
    "🎁 Enjoy a hot chocolate!",
    "🌟 Believe in the magic of Christmas!",
    "🎅 Santa is on his way!",
    "🎀 Wrap up some gifts!",
    "☃️ Build a snowman today!",
    "🎵 Sing your favorite carol!",
    "🦌 Rudolph is ready to fly!",
    "✨ May your days be merry!",
    "🍪 Share some cookies with a friend!",
    "🕯️ Light a festive candle!",
    "❄️ Snowflakes are unique, just like you!",
    "🎉 Celebrate with family and friends!",
    "🌟 A shining star to guide your way!",
    "💌 Send a kind note to someone!",
    "🍬 Enjoy a sweet treat!",
    "🔔 Jingle bells, jingle bells!",
    "📖 Read a holiday story!",
    "🎶 Listen to festive tunes!",
    "🎊 Throw a mini holiday party!",
    "🌲 Go for a winter walk!",
    "💖 Spread holiday cheer!",
    "☕ Cozy up with a warm drink!"
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