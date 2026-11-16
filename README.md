# 🎄 Advent calendar

> _A cozy, customizable online Advent calendar for any December, every year._

![The calendar: "Merry Christmas!" above 24 red doors on a blurred photo of Christmas lights](assets/screenshot-placeholder.jpg)

Ho ho ho! This is a little web project for making your _own_ online Advent calendar. Fill its 24 doors with pictures, short messages, YouTube videos, or recordings, put it online, and share the link with friends, family, or your class. Each day in December, one more door opens.

It is plain HTML, CSS, and JavaScript: nothing to install, no build step, and no server code. If you can edit a text file, you can make it yours.

The repository is called _adventCalendar2025_ because that is the year it started, but the calendar works in any year.

---

## ✨ What it does

- **🎁 24 doors, one surprise each:** a picture, a short message, a YouTube video, or a recording with an optional picture.
- **🕰️ Doors open by date.** Each door unlocks at midnight on its December day, in the visitor's own time zone, even if the page has been open all night. Earlier doors stay open. A locked door answers with a playful message.
- **🔀 A shuffled order** for each visitor, which stays the same on their device.
- **🗃️ Remembers opened doors** on each visitor's device. A Reset button, with a confirmation step, closes all doors and shuffles them again.
- **🔗 A link for every door,** ready to turn into a QR code for cards, gift tags, or a poster.
- **🔊 Optional "Ho Ho Ho"** when a door is opened for the first time. Visitors switch it on themselves, and the setting is remembered.
- **❄️ Falling snow,** which stops when the visitor's device is set to reduce motion.
- **📱 Works on phones, tablets, and desktops.**
- **🌐 English and German.** Visitors whose browser is set to German get German messages, labels, and buttons.
- **♿ Keyboard and screen-reader friendly.** See [Accessibility](#-accessibility-and-compatibility).
- **🧑‍🎄 Festive details:** a candy-cane cursor, snow-capped doors, and Christmas colors.

---

## 🚀 Quick start

1. **Get the files.** Click the green **Code** button above and choose **Download ZIP**, then unzip it. Or clone the repository:

   ```bash
   git clone https://github.com/HenniePenny/adventCalendar2025.git
   ```

2. **Open `index.html` in your browser** by double-clicking it.

3. **Fill the doors** with your own surprises (see [Make it your own](#-make-it-your-own)).

4. **Put it online** to share it (see [Publishing](#-publishing)).

> **All doors locked?** That is expected. Outside December, and before each door's day, the doors stay locked. To look behind them while you work, turn on [testing mode](#-testing).

---

## 🎨 Make it your own

### Easy mode: swap the files

To use your own pictures without touching any code, replace the files in `assets/surprises/` with your own, keeping **the same file names and file types**. For example, `berlin-sugar-love.png` must be replaced by a PNG called `berlin-sugar-love.png`. The file names for each day are listed in the `surprises` list in `script.js`.

The descriptions that screen readers read out (the `alt` text) still describe the old pictures, so update them in `script.js` as well when you can.

### The surprises list

Every door's content lives in the `surprises` list near the middle of `script.js`. It has exactly 24 entries, in order from day 1 to day 24. To change a day's surprise, replace its entry. You can mix the four types freely.

| Type | Fields | Shows |
| --- | --- | --- |
| `image` | `src`, `alt` | A picture |
| `text` | `title`, `body` | A short message or quote |
| `youtube` | `url`, `title` | An embedded YouTube video |
| `audio` | `src` (required), `title`, `description`, `image`, `alt` | An audio player, with an optional picture above it |

```js
{
  type: "image",
  src: "assets/surprises/my-photo.webp",
  alt: "A mug of cocoa and cookies by the fire"
},
{
  type: "text",
  title: "A thought for today",
  body: "Every door you open is a small reason to smile."
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

Keep the commas between entries, and the quotation marks around each value. Always give a picture an `alt` text that says what it shows, so visitors who use screen readers know too.

Put your files in the `assets/surprises/` folder. WebP pictures of about 900 × 900 px load quickly on phones.

### 🎧 Audio surprises

An audio door opens a popup with the browser's own audio player, so it works with touch, keyboard, and screen readers on phones and desktops.

- **Nothing plays by itself.** Visitors press Play, and can pause and skip around. The recording stops when the popup closes or another door opens.
- **Pictures are optional.** With an `image`, the picture appears above the player and on the opened door, with a small ♫ badge.
- **Use MP3.** It plays in every modern browser, including Safari on iPhone. For spoken recordings, 64 kbps mono keeps a two-minute story at about 1 MB.
- **The "Ho Ho Ho" and the recording never overlap.** The laugh stops as soon as the visitor presses Play.

### Heading

The "Merry Christmas!" heading is in `index.html`. Change the text between `<h1>` and `</h1>`.

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

---

## 🧪 Testing

You do not have to wait for December to see behind the doors. Near the top of `script.js` you will find two switches.

**Unlock every door:**

```js
const FORCE_TESTING_MODE = true;
```

A badge in the corner shows that testing mode is on.

**Pretend it is a certain day in December:** remove the `//` in front of these two lines and set the day you want. The doors then behave as they would on that day, including unlocking the next door at midnight.

```js
// today.setMonth(11);   // December (0-based)
// today.setDate(12);
```

**Before you publish,** set `FORCE_TESTING_MODE` back to `false` and put the `//` back in front of the two date lines. Both settings apply to every visitor.

### 📱 Testing on your live website

To test on a real phone after your calendar is online, make a temporary copy instead of switching on testing mode for everyone:

1. Copy `index.html` to `preview.html` and `script.js` to `preview-script.js`.
2. In `preview.html`, change `script.js` to `preview-script.js`, and add this line inside `<head>` so search engines skip the page:
   `<meta name="robots" content="noindex, nofollow">`
3. In `preview-script.js`, set `FORCE_TESTING_MODE = true`.
4. Upload both files and open `yoursite.com/preview.html` **in a private or incognito window**. The calendar remembers opened doors in the browser, and a private window keeps that memory separate, so doors you open while testing will not show as opened on your real calendar.
5. Delete both files when you are done.

---

## 🌍 Publishing

The calendar is a static website, so any web host works, for example **GitHub Pages**, **Netlify**, **Vercel**, or your own web space.

1. Check that `FORCE_TESTING_MODE` is `false` and the two test date lines start with `//`.
2. Upload `index.html`, `styles.css`, `script.js`, `snowEffect.js`, and the `assets/` folder.
3. Open your calendar's address. If you uploaded changes and do not see them, reload the page with Ctrl+Shift+R (Windows, Linux) or Cmd+Shift+R (Mac).

---

## 🔐 How door locking works

- Each door unlocks at midnight on its December day, by the visitor's local date and time. Doors unlock even if the page stays open, without a reload.
- Earlier doors stay open for the rest of December.
- Outside December, every door is locked. Use [testing mode](#-testing) to preview.
- Each new December starts with all doors closed again, so the same calendar can be used year after year.

---

## 🔗 Direct door links and QR codes

Every door has its own link. Add `?day=` and the door number to your calendar's address:

```
https://yoursite.com/?day=7
```

When the page loads, the calendar scrolls to that door and opens it. Turn each link into a QR code, and you can put the doors on printed cards, gift tags, or a poster.

- **Locked doors stay locked.** If someone scans a code before the door's day, they see the usual locked-door message, not the surprise.
- **Any QR code generator works.** The calendar only needs the link, so make one code for each day from `?day=1` to `?day=24`.
- **Test before you print.** With the [preview copy](#-testing-on-your-live-website), use `preview.html?day=7` and so on, and scan each code with your phone to check that it opens the right door. Make the final codes with your real address.
- **Wrong numbers are ignored.** A missing number, or one outside 1 to 24, simply loads the calendar as usual.

---

## 🗃️ What the calendar remembers

The calendar keeps its memory in each visitor's browser (`localStorage`), on that device only. A visitor who switches from phone to laptop starts fresh on the laptop. If the browser blocks storage, the calendar still works but forgets opened doors when the page is closed.

| Key | Purpose |
| --- | --- |
| `openedDoors-YYYY-12` | Doors opened this December (a new key each year) |
| `doorOrder` | The visitor's shuffled door order |
| `soundEnabled` | Whether the "Ho Ho Ho" is switched on |

The Reset button clears the opened doors and shuffles the order again.

---

## ♿ Accessibility and compatibility

- Works in current versions of Chrome, Safari, Firefox, and Edge.
- Supports mouse, touch, and keyboard: every door is a button you can reach with Tab and open with Enter or Space.
- Screen readers announce each door, for example "Door 5, locked. Opens on December 5.", and the locked-door message.
- The surprise popup and the reset dialog keep keyboard focus inside, close with Esc, and return focus to where you were. The reset dialog starts on Cancel, so a stray Enter cannot clear anyone's progress.
- The snow and the door animations stop when the device is set to reduce motion.
- Door labels, the close button, and the reset buttons switch to German for German browsers.

🎄 **Ongoing improvements:**  
We are working to make this calendar usable and enjoyable for _everyone_. Next on the roadmap: enhanced color-contrast options.

---

## 👩‍💻 Authors

**Created by:** [@HenniePenny](https://github.com/HenniePenny) & [@tlcoles](https://github.com/tlcoles)  
Built with care, curiosity, and a sprinkle of Christmas magic. 🎄

---

## 🎥 Acknowledgements

A sleighful of thanks to all the creators whose work adds sparkle to this project:

- **Public domain Christmas cartoons** featured via YouTube, including classics like
  _Christmas Comes But Once a Year_ (1936, Fleischer Studios),
  _Jack Frost_ (1934, Ub Iwerks),
  _Snow Foolin'_ (1949, Famous Studios),
  _The Pups' Christmas_ (1936, Happy Harmonies), and more.
- **Festive imagery** adapted from freely available, royalty-free sources such as [Pixabay](https://pixabay.com/), [Unsplash](https://unsplash.com/), and [Pexels](https://www.pexels.com/).
- **The font** _Henny Penny_, the happiest font around, from [Google Fonts](https://fonts.google.com/).

And of course:

> 🪄 _Special thanks to all the coders whose work seeds the large language model behind ChatGPT (OpenAI). We used this resource for technical guidance, code wizardry, and creative collaboration throughout development._

---

## 🧑‍💻 Contributing

Found a bug in Santa's code? Got a bright idea for a new festive feature? Fork the repository, make your changes, and send a pull request. The elves will thank you!

Changes that help every calendar are the best fit here. If you make a calendar with your own content and look, keep those in your fork, and feel free to tell us about it.

---

## 📜 License

**Made with ❤️, JavaScript, and a pinch of cinnamon.**
Free to use, share, and remix — just spread the joy and credit the original project.
Happy coding, and may your December always be merry! 🎅
