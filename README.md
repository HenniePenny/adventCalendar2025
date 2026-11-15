# 🎄 Advent Calendar 2025

> _A cozy, customizable digital advent calendar — perfect for any December, every year._

![Screenshot of the Advent Calendar](assets/screenshot-placeholder.jpg)

Ho ho ho! Welcome to **Advent Calendar 2025**, a joyful little web project that lets you create your _own_ online advent calendar.

Whether you’re surprising friends, delighting family, or spreading cheer in your classroom, this calendar unlocks a new surprise each day in December — images, videos, or messages — all with festive sparkle.

---

## ✨ Features

- **🎁 Daily surprises** — Each door unlocks a new image, message, or YouTube video.
- **🕰️ Date-gated magic** — Doors open only on or after their day (Dec 1–24).
- **🔗 Direct door links:** Add `?day=7` to the calendar address to open door 7 straight away, ready to turn into a QR code.
- **🗃️ Memory included** — The calendar remembers opened doors until you reset it, with a friendly confirmation dialog so progress isn’t wiped by accident.
- **🧁 Customizable** — Swap in your own images, videos, or quotes — no coding skills required.
- **❄️ Falling snow** — Gentle snowflakes float across your screen (unless your device says “no thanks” to motion).
- **🔊 Ho Ho Ho toggle** — Optional Santa laugh when you open a door!
- **🎧 Audio surprises:** Play a recording behind a door, such as a story, a song, or a greeting, with an optional picture.
- **📱 Fully responsive** — Looks great on phones, tablets, and big desktop displays.
- **🧑‍🎄 Festive flair** — Candy-cane cursor, snow-capped doors, and Christmas coloring.

---

## 🛠️ Setup

1. **Download or clone this repository:**

   ```bash
   git clone https://github.com/HenniePenny/adventCalendar2025.git
   ```

2. **Open the project folder**, then double-click `index.html` to open it in your browser.
   That’s it! No installation, no build process — just pure, static HTML + CSS + JS joy.

3. _(Optional)_ Host it on your favorite static site service such as **GitHub Pages**, **Netlify**, or **Vercel** to share with others.

---

## 🧪 Testing your calendar

While you’re building or customizing, you don’t have to wait until December 1 to peek behind the doors.

Inside script.js, near the top, you’ll find:

```js
// --- TEMPORARY: pretend today's date is Dec 10 for testing ---
today.setMonth(11); // December (0-based)
today.setDate(12);
```

You can change the day number to preview any date.

To unlock every door instantly, set:

```js
const FORCE_TESTING_MODE = true;
```

When you’re ready to go live, simply comment those lines back out and reset:

```js
const FORCE_TESTING_MODE = false;
```

Now the calendar will open each door only on its proper December day. 🎁

### 📱 Testing on your live website

`FORCE_TESTING_MODE` unlocks the doors for every visitor, so only use it on your own computer. To test on a real phone after your calendar is online, make a temporary copy instead:

1. Copy `index.html` to `preview.html` and `script.js` to `preview-script.js`.
2. In `preview.html`, change `script.js` to `preview-script.js`, and add this line inside `<head>` so search engines skip the page:
   `<meta name="robots" content="noindex, nofollow">`
3. In `preview-script.js`, set `FORCE_TESTING_MODE = true`.
4. Upload both files and open `yoursite.com/preview.html` **in a private or incognito window**. The calendar remembers opened doors in the browser, and a private window keeps that memory separate, so doors you open while testing will not show as opened on your real calendar.
5. Delete both files when you are done.

---

## 🔐 How door locking works

The calendar automatically unlocks each door on its correct day in **any December** based on the visitor’s local date.

No configuration is needed — as long as you’re viewing the calendar during December, each day opens at midnight and earlier days stay open.

Outside of December, the calendar automatically enters **testing mode**, which unlocks all doors so you can preview your content.

---

## 🔗 Direct door links and QR codes

Every door has its own link. Add `?day=` and the door number to your calendar's address:

```
https://yoursite.com/?day=7
```

When the page loads, the calendar scrolls to that door and opens it. Turn each link into a QR code, and you can put the doors on printed cards, gift tags, or a poster.

- **Locked doors stay locked.** If someone scans a code before the door's day, they see the usual locked-door message, not the surprise.
- **Any QR code generator works.** The calendar only needs the link, so make one code for each day from `?day=1` to `?day=24`.
- **Test before you print.** Outside December, testing mode unlocks every door, so you can scan each code with your phone and check that it opens the right door.
- **Wrong numbers are ignored.** A missing number, or one outside 1 to 24, simply loads the calendar as usual.

---

## 🎨 Make it your own

Everything you need lives inside the `script.js` file — look for the **`surprises`** array.

Each entry looks like this:

```js
{
  type: "image",
  src: "assets/surprises/my-photo.webp",
  alt: "A cozy mug of cocoa and cookies by the fire"
},
{
  type: "youtube",
  url: "https://youtu.be/dQw4w9WgXcQ",
  title: "A festive favorite"
},
{
  type: "audio",
  src: "assets/surprises/my-story.mp3",
  title: "A story for today",
  image: "assets/surprises/my-story.webp",
  alt: "A bear in a red scarf reading a book under string lights"
}
```

You can mix and match:

- `type: "image"` → use local images in your `assets/surprises` folder
- `type: "youtube"` → embed cheerful videos
- `type: "text"` → show short messages or quotes
- `type: "audio"` → play a recording, with an optional picture

💡 **Tip:** You don’t need to change the code logic — just replace the content inside the array.

### 🎧 Audio surprises

An audio door opens a popup with the browser's own audio player, so it works with touch, keyboard, and screen readers on phones and desktops.

- **Nothing plays by itself.** Visitors press Play, and can pause and skip around. The recording stops when the popup closes or another door opens.
- **`src` is required.** `title`, `description`, `image`, and `alt` are optional.
- **Pictures are optional.** With an `image`, the picture appears above the player and on the opened door, with a small ♫ badge. Always add an `alt` text that describes the picture.
- **Use MP3.** It plays in every modern browser, including Safari on iPhone. For spoken recordings, 64 kbps mono keeps a two-minute story at about 1 MB, which loads quickly on phones.
- **The Santa laugh still works.** If the "Ho Ho Ho" sound is on, it plays when the door is first opened and stops as soon as the visitor presses Play.

### 🎨 Door colors

Every door is red until it is opened, then green. To give doors their own colors, set these custom properties in your own stylesheet, loaded after `styles.css`:

- `--door-bg`: the closed door's background (a color or a gradient)
- `--door-ink`: the color of the door number
- `--door-opened-bg`: the opened door's background

Each door carries its day number in `data-day`, so you can color one door, a few, or all 24:

```css
/* All doors */
.door { --door-bg: #286e4a; }

/* Single doors */
.door[data-day="5"]  { --door-bg: #db342b; }
.door[data-day="12"] { --door-bg: #f3b629; --door-ink: #17241e; }

/* Keep each door's own color after it is opened */
.door { --door-opened-bg: var(--door-bg); }
```

Doors without a setting keep the default colors. Pick number colors with enough contrast against each background.

### Easy mode ( no coding )

If you don’t want to edit JavaScript, simply replace the images in the `assets/surprises` folder using the same file names.

Your calendar will automatically show your new pictures.

---

## 🔔 Optional extras

- **Reset button:** Clears progress and reshuffles door order, with confirmation popup.
- **Sound toggle:** Turn the “Ho Ho Ho” effect on / off — the setting is remembered. On audio doors, the laugh stops when the recording starts.
- **Snow effect:** Automatically adapts to screen size and disables itself if the user prefers reduced motion.

---

## ♿ Accessibility & compatibility

- Works on modern browsers — Chrome, Safari, Firefox, Edge.
- Respects “Reduce Motion” settings for accessibility.
- Supports both mouse and touch input.
- Keyboard navigation and focus outlines included.

🎄 **Ongoing improvements:**  
We’re actively working to expand accessibility support to ensure this calendar is usable and enjoyable for _everyone_. Our roadmap includes improved keyboard flow, stronger screen-reader support, and enhanced color-contrast options.

---

## 👩‍💻 Authors

**Created by:** [@HenniePenny](https://github.com/HenniePenny) & [@tlcoles](https://github.com/tlcoles)  
Built with care, curiosity, and a sprinkle of Christmas magic. 🎄

---

## 🎥 Acknowledgements

A sleighful of thanks to all the creators whose work adds sparkle to this project:

- **Public domain Christmas cartoons** featured via YouTube — including classics like
  _“Christmas Comes But Once a Year”_ (1936, Fleischer Studios),
  _“Jack Frost”_ (1934, Ub Iwerks),
  _“Snow Foolin’”_ (1949, Famous Studios),
  _“The Pups’ Christmas”_ (1936, Happy Harmonies), and more.
- **Festive imagery** adapted from freely available, royalty-free sources such as [Pixabay](https://pixabay.com/), [Unsplash](https://unsplash.com/) and [Pexels](https://www.pexels.com/).
- **Fonts** from [Google Fonts](https://fonts.google.com/) — _Henny Penny_, the happiest font around.

And of course:

> 🪄 _Special thanks to all the coders whose work seeds the large language model behind ChatGPT (OpenAI). We used this resource for technical guidance, code wizardry, and creative collaboration throughout development._

---

## 🧑‍💻 Contributing

Found a bug in Santa’s code? Got a bright idea for a new festive feature?
Fork the repo, make your tweaks, and send a pull request — the elves will thank you!

---

## 📜 License

**Made with ❤️, JavaScript, and a pinch of cinnamon.**
Free to use, share, and remix — just spread the joy and credit the original project.
Happy coding, and may your December always be merry! 🎅
