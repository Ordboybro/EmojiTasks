# 😀 EmojiTasks

> A gamified task manager that turns everyday tasks into XP, levels, streaks and achievements.

EmojiTasks is a client-side task manager built with vanilla JavaScript. Your tasks and game progress are stored locally in the browser, so the project works without a backend.

## ✨ Features

- ➕ Add, complete and delete tasks
- 😎 Choose an emoji for every task
- 🎮 XP reward system — completed tasks give `+10 XP`
- 🏆 Level progression — every `100 XP` advances the level
- 🔥 Daily streak tracking
- 📊 Total, completed and active task statistics
- 📈 Completed vs active task chart
- 🏅 Achievements
- 🧹 Clear all completed tasks
- 💾 Local browser persistence with `localStorage`
- 📱 Responsive layout for desktop and mobile
- ♿ Keyboard-friendly controls and accessible labels
- 🛡️ User task text is rendered safely without injecting HTML

## 🎮 How the game system works

### XP

Every time an active task is completed:

```text
+10 XP
```

When the current XP reaches `100`, the player levels up and the XP progress starts again from zero.

### Streak

Complete at least one task on consecutive days to continue the streak. If a day is missed, the next completed task starts a new streak.

### Achievements

| Achievement | Requirement |
| --- | --- |
| 🎯 First Task | Complete 1 task |
| 🚀 Complete 10 Tasks | Complete 10 tasks |
| 👑 Reach Level 5 | Reach level 5 |

## 🛡️ Data & Privacy

EmojiTasks is a client-side application.

- Tasks are stored in the browser using `localStorage`.
- XP, level and streak data are also stored locally.
- No application backend is used.
- No account or registration is required.
- Task text is inserted into the DOM with `textContent`, rather than interpreted as HTML.

Clearing the site's browser storage will remove the saved application data.

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` API
- Chart.js for the progress chart

## 📂 Project Structure

```text
EmojiTasks/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Run locally

Clone the repository:

```bash
git clone https://github.com/Ordboybro/EmojiTasks.git
cd EmojiTasks
```

You can open `index.html` directly in a modern browser.

For a local HTTP server, use Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🌐 GitHub Pages

EmojiTasks is a static web application and can be deployed with GitHub Pages.

Use:

```text
Settings → Pages → Deploy from a branch → main → / (root)
```

## 📱 Responsive Design

The interface adapts to desktop, tablet and mobile screen sizes.

## 📈 Project Status

**Active development.** This project is part of my programming learning portfolio and is being improved as I learn more about JavaScript, software architecture and web development.

## 👨‍💻 Author

**ORDBOY**

GitHub: https://github.com/Ordboybro
