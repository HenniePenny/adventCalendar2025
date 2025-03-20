  // Check if user prefers reduced motion
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery && mediaQuery.matches) {
    // If reduced motion is preferred, we do not run the snow effect
    // (The CSS also hides the canvas, but this is a safe double-check)
    console.log("Reduced motion enabled; Snow animation disabled.");
  } else {
    // Only run the snow animation if the screen is large enough
    // and user hasn't indicated reduced motion
    if (window.innerWidth >= 768) {
      initSnowCanvas();
    }
  }

  /**
   * Initialize the snow canvas animation
   */
  function initSnowCanvas() {
    const canvas = document.getElementById("snowCanvas");
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Array to hold snowflake data
    let flakes = [];

    // Snowflake count and other settings
    const maxFlakes = 50; // Adjust for more or fewer snowflakes
    const snowflakeColor = "rgba(255, 255, 255, 0.8)"; // White with some transparency

    /**
     * Create an object representing a single snowflake
     */
    function createFlake() {
      // Random x position
      let x = Math.random() * width;
      // Slightly random size
      let size = Math.random() * 3 + 2;
      // Random y position (start above the visible screen if desired)
      let y = Math.random() * -height; 
      // Random speed
      let speed = Math.random() + 0.5;
      // Horizontal drift
      let drift = (Math.random() - 0.5) * 0.5; 

      return { x, y, size, speed, drift };
    }

    /**
     * Populate initial snowflake array
     */
    for (let i = 0; i < maxFlakes; i++) {
      flakes.push(createFlake());
    }

    /**
     * Animation loop
     */
    function animate() {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw each flake
      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];

        // Move the snowflake down
        flake.y += flake.speed;
        // Add a slight horizontal drift
        flake.x += flake.drift;

        // If flake goes beyond the bottom, reset it to the top
        if (flake.y > height) {
          flakes[i] = createFlake();
          flakes[i].y = 0; // Start again at the top
        }

        // Draw the flake (a simple circle)
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = snowflakeColor;
        ctx.fill();
      }

      // Request next frame
      requestAnimationFrame(animate);
    }

    // Listen for window resize to update canvas dimensions
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Start the animation loop
    animate();
  }
  console.log("Snow script is running...");