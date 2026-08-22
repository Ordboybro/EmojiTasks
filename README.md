# 😀 EmojiTasks

> A privacy-first gamified task manager: tasks → XP → levels → streaks → achievements.

**Live demo:** https://ordboybro.github.io/EmojiTasks/

EmojiTasks is a static, client-side productivity app built with vanilla JavaScript. It turns a normal task list into a lightweight game while keeping the application's data in the browser.

## ✨ v2.0 highlights

- 🎮 XP and level progression
- 🔥 Daily streak system
- 🏅 **6 permanent achievements**
- 📋 Add, complete, restore, edit and delete tasks
- 😀 12 task emoji options
- 🚦 Low / medium / high priorities
- 📅 Optional deadlines with overdue detection
- 🔎 Live task search
- 🎚️ All / active / completed / high-priority filters
- ↕️ Newest / priority / deadline / A–Z sorting
- 📊 Live progress chart built with native Canvas — **no Chart.js/CDN dependency**
- 📈 Total / completed / active / overdue statistics
- 🧹 Clear completed tasks
- 💾 Versioned `localStorage` state with migration from the previous EmojiTasks format
- 🛡️ Safe DOM rendering with `textContent`
- 📱 Responsive mobile, tablet and desktop UI
- ♿ Keyboard focus states and reduced-motion support
- 🌐 No external runtime dependencies

## 🎮 Game system

### XP & levels

Completing an active task gives:

```text
+10 XP
```

Every `100 XP` advances the player by one level. XP progress resets after a level-up.

Undoing a completed task changes the task back to active, but **does not remove XP already earned**. This prevents repeatedly completing and undoing tasks from manipulating the progression system and keeps earned XP meaningful.

### Streaks

The streak counts days on which you complete at least one task:

- Complete a task today → start/continue the streak.
- Complete more tasks today → the streak does not increase again.
- Miss a calendar day → the next completion starts a new streak.

### Achievements

Achievements use lifetime counters, so deleting completed tasks does not remove previously earned milestones.

| Achievement | Requirement |
| --- | --- |
| 🎯 First Task | Complete 1 task |
| 🚀 10 Tasks | Complete 10 tasks |
| 👑 Level 5 | Reach level 5 |
| 🔥 25 Tasks | Complete 25 tasks |
| 💯 100 XP | Earn 100 lifetime XP |
| ⚡ Perfect Day | Complete 5 tasks in one day |

## 📋 Task management

Every task can contain:

- Emoji
- Name (up to 200 characters)
- Priority
- Optional deadline
- Completion state

Tasks can be searched, filtered, sorted, edited, completed/restored and deleted.

Overdue tasks are detected automatically when their deadline is before the current local date.

## 📊 Progress

The progress card uses the browser's native **Canvas API** to draw the completed/active task chart. This means the application no longer depends on Chart.js, jsDelivr, or any other third-party runtime resource.

The percentage in the center is calculated as:

```text
completed tasks / total tasks × 100
```

## 🛡️ Privacy & data

EmojiTasks has **no backend and no account system**.

The following data is stored locally in the browser:

- Tasks
- XP and level
- Current streak
- Lifetime completed-task counter
- Lifetime XP
- Completion-day counters used for achievements

No task data is sent to a server by the application.

Task names are inserted into the page using DOM APIs and `textContent`, not `innerHTML`, so a task containing HTML-like text is treated as plain text.

> Clearing the site's browser storage removes local EmojiTasks data. There is no server-side copy to restore it from.

## 🔄 Data migration

v2 stores all application state under:

```text
emojiTasks.state.v2
```

When v2 does not find that state, it attempts to migrate the previous keys (`emojiTasks`, `emojiXP`, `emojiLevel`, `emojiStreak`, `lastTaskDate`). This allows an existing browser installation to move to v2 without manually exporting its data.

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- `localStorage`
- Web Crypto API when available for task IDs

**No frameworks. No npm. No build step. No backend. No CDN dependency.**

## 📂 Project structure

```text
EmojiTasks/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## 🚀 Run locally

Clone the repository:

```bash
git clone https://github.com/Ordboybro/EmojiTasks.git
cd EmojiTasks
```

You can open `index.html` directly, but a local HTTP server is recommended:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🌐 GitHub Pages

EmojiTasks is a static site and works with GitHub Pages.

Typical setup:

```text
Repository → Settings → Pages → Deploy from a branch → main → / (root)
```

Live demo:

https://ordboybro.github.io/EmojiTasks/

## 🔐 Security-minded implementation details

- User task text is rendered with `textContent`.
- Task IDs prefer `crypto.randomUUID()` / `crypto.getRandomValues()`.
- No task text is logged or transmitted.
- There is no remote database.
- There is no third-party analytics code.
- The app gracefully handles unavailable browser storage.
- The state format is normalized when loaded to tolerate malformed/old values.

## 📱 Browser support

EmojiTasks targets modern browsers with support for:

- ES2020+ JavaScript
- Canvas 2D
- `localStorage`
- CSS `backdrop-filter` for the full visual effect (optional)

## 📈 Project status

**Portfolio project — v2.0**

EmojiTasks is being developed as a practical frontend project with an emphasis on clean JavaScript, state management, browser APIs, safe DOM manipulation, responsive UI and useful product features.

## 👨‍💻 Author

**ORDBOY**

- GitHub: https://github.com/Ordboybro
- Repository: https://github.com/Ordboybro/EmojiTasks
