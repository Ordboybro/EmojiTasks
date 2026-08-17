# 😀 EmojiTasks

> A gamified task manager that turns everyday tasks into XP, levels, streaks and achievements.

**Live demo:** https://ordboybro.github.io/EmojiTasks/

EmojiTasks is a client-side task manager built with vanilla JavaScript. Your tasks and game progress are stored locally in the browser, so the application works without a backend or account.

## ✨ Features

- ➕ Add, complete, restore and delete tasks
- 😎 Choose an emoji for every task
- 🎮 XP reward system — completed tasks give `+10 XP`
- 🏆 Level progression — every `100 XP` advances the level
- 🔥 Daily streak tracking
- 📊 Total, completed and active task statistics
- 📈 Completed vs active task chart
- 🏅 Achievement system
- 🧹 Clear all completed tasks
- 💾 Local browser persistence with `localStorage`
- 📱 Responsive desktop and mobile layout
- ♿ Keyboard-friendly controls and accessible labels
- 🛡️ Task text is rendered safely without injecting HTML
- 🧩 Graceful chart fallback when the Chart.js CDN is unavailable

## 🎮 How the game system works

### XP

Every time an active task is completed:

```text
+10 XP
```

When the current XP reaches `100`, the player levels up and the XP progress starts again from zero.

### Streak

Complete at least one task on consecutive days to continue the streak. Completing multiple tasks on the same day does not increase it multiple times. If a day is missed, the next completed task starts a new streak.

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

> **Note:** Chart.js is loaded from jsDelivr for the progress chart. If the CDN is unavailable, the rest of the application remains usable and the chart shows a fallback message.

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` API
- Chart.js

## 📂 Project Structure

```text
EmojiTasks/
├── index.html
├── style.css
├── script.js
├── .gitignore
└── README.md
```

## 🚀 Run locally

Clone the repository:

```bash
git clone https://github.com/Ordboybro/EmojiTasks.git
cd EmojiTasks
```

For the most reliable browser behavior, start a local HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🌐 GitHub Pages

EmojiTasks is a static web application and can be deployed with GitHub Pages.

```text
Settings → Pages → Deploy from a branch → main → / (root)
```

Live demo:

https://ordboybro.github.io/EmojiTasks/

## 📱 Responsive Design

The interface adapts to desktop, tablet and mobile screen sizes.

## 📈 Project Status

**Portfolio project — actively improved as part of my programming learning journey.**

The current version focuses on clean client-side JavaScript, browser storage, safe DOM manipulation, responsive UI and practical application architecture.

## 👨‍💻 Author

**ORDBOY**

GitHub: https://github.com/Ordboybro
