// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar"); // Reference to the calendar container

    // Array of surprises (mix of text and images) for the doors
    const surprises = [
        "❄️ Winter is coming!",
        "🎄 Deck the halls!",
        "🎁 Enjoy a hot chocolate!",
        "🌟 Believe in the magic of Christmas!",
        '<img src="https://via.placeholder.com/100?text=🎅" alt="Santa">',
        '<img src="https://via.placeholder.com/100?text=🎁" alt="Gift">',
        "☃️ Build a snowman today!",
        "🎵 Sing your favorite carol!",
        '<img src="https://via.placeholder.com/100?text=🎄" alt="Tree">',
        "✨ May your days be merry!",
        "🍪 Share some cookies!",
        "🕯️ Light a festive candle!",
        '<img src="https://via.placeholder.com/100?text=❄️" alt="Snowflake">',
        "🎉 Celebrate with family!",
        '<img src="https://via.placeholder.com/100?text=🌟" alt="Star">',
        "💌 Send a kind note to someone!",
        "🍬 Enjoy a sweet treat!",
        '<img src="https://via.placeholder.com/100?text=☃️" alt="Snowman">',
        "📖 Read a holiday story!",
        "🎶 Listen to festive tunes!",
        '<img src="https://via.placeholder.com/100?text=✨" alt="Sparkle">',
        "🌲 Go for a winter walk!",
        "💖 Spread holiday cheer!",
        "🎀 Wrap up some gifts!"
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
