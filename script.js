const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const taskInput = $("#taskInput");
const taskEmoji = $("#taskEmoji");
const taskPriority = $("#taskPriority");
const taskDueDate = $("#taskDueDate");
const addTaskBtn = $("#addTaskBtn");
const clearCompletedBtn = $("#clearCompletedBtn");
const taskList = $("#taskList");
const emptyTasks = $("#emptyTasks");
const noResults = $("#noResults");
const taskSummary = $("#taskSummary");
const taskSearch = $("#taskSearch");
const taskSort = $("#taskSort");
const filterButtons = $$(".filter-btn");

const totalTasksEl = $("#totalTasks");
const completedTasksEl = $("#completedTasks");
const activeTasksEl = $("#activeTasks");
const overdueTasksEl = $("#overdueTasks");
const lifetimeCompletedEl = $("#lifetimeCompleted");

const xpEl = $("#xp");
const levelEl = $("#level");
const maxXpEl = $("#maxXp");
const progressBar = $("#progressBar");
const progressContainer = $(".progress-container");
const streakEl = $("#streak");

const chartCanvas = $("#progressChart");
const chartPercent = $("#chartPercent");
const toast = $("#toast");

const XP_PER_LEVEL = 100;
const XP_REWARD = 10;
const MAX_TASK_LENGTH = 200;
const STORAGE_KEY = "emojiTasks.state.v2";
const LEGACY_KEYS = {
    tasks: "emojiTasks",
    xp: "emojiXP",
    level: "emojiLevel",
    streak: "emojiStreak",
    lastTaskDate: "lastTaskDate"
};
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABELS = {
    high: "🔴 High",
    medium: "🟡 Medium",
    low: "🟢 Low"
};

const DEFAULT_STATE = {
    tasks: [],
    xp: 0,
    level: 1,
    streak: 0,
    lastTaskDate: null,
    lifetimeCompleted: 0,
    lifetimeXp: 0,
    completionDays: {}
};

let state = loadState();
let activeFilter = "all";
let searchQuery = "";
let toastTimer = null;

function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (globalThis.crypto?.getRandomValues) {
        const bytes = new Uint32Array(2);
        globalThis.crypto.getRandomValues(bytes);
        return `${Date.now()}-${bytes[0].toString(36)}-${bytes[1].toString(36)}`;
    }
    return `${Date.now()}-${String(performance.now()).replace(".", "")}`;
}

function safeLocalStorage(action, fallback = null) {
    try {
        return action(localStorage);
    } catch {
        return fallback;
    }
}

function normalizeTask(task) {
    if (!task || typeof task !== "object") return null;
    const text = typeof task.text === "string" ? task.text.trim().slice(0, MAX_TASK_LENGTH) : "";
    if (!text) return null;

    const priority = ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium";
    const dueDate = typeof task.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? task.dueDate : "";

    return {
        id: String(task.id || createId()),
        text,
        emoji: typeof task.emoji === "string" && task.emoji ? task.emoji : "📝",
        priority,
        dueDate,
        completed: Boolean(task.completed),
        createdAt: Number.isFinite(Number(task.createdAt)) ? Number(task.createdAt) : Date.now(),
        completedAt: Number.isFinite(Number(task.completedAt)) ? Number(task.completedAt) : null
    };
}

function loadState() {
    const stored = safeLocalStorage((storage) => storage.getItem(STORAGE_KEY));

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return normalizeState(parsed);
        } catch {
            // Fall through to legacy migration.
        }
    }

    return migrateLegacyState();
}

function normalizeState(value) {
    const source = value && typeof value === "object" ? value : {};
    const tasks = Array.isArray(source.tasks) ? source.tasks.map(normalizeTask).filter(Boolean) : [];
    const completionDays = source.completionDays && typeof source.completionDays === "object" ? source.completionDays : {};

    return {
        ...DEFAULT_STATE,
        tasks,
        xp: clampInteger(source.xp, 0),
        level: Math.max(1, clampInteger(source.level, 1)),
        streak: clampInteger(source.streak, 0),
        lastTaskDate: typeof source.lastTaskDate === "string" ? source.lastTaskDate : null,
        lifetimeCompleted: Math.max(0, clampInteger(source.lifetimeCompleted, tasks.filter((task) => task.completed).length)),
        lifetimeXp: Math.max(0, clampInteger(source.lifetimeXp, 0)),
        completionDays: { ...completionDays }
    };
}

function clampInteger(value, fallback) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function migrateLegacyState() {
    const tasksRaw = safeLocalStorage((storage) => storage.getItem(LEGACY_KEYS.tasks), null);
    let legacyTasks = [];

    try {
        legacyTasks = Array.isArray(JSON.parse(tasksRaw)) ? JSON.parse(tasksRaw) : [];
    } catch {
        legacyTasks = [];
    }

    const migratedTasks = legacyTasks.map((task) => normalizeTask({ ...task, createdAt: Date.now() })).filter(Boolean);
    const legacyXp = clampInteger(safeLocalStorage((storage) => storage.getItem(LEGACY_KEYS.xp), 0), 0);
    const legacyLevel = Math.max(1, clampInteger(safeLocalStorage((storage) => storage.getItem(LEGACY_KEYS.level), 1), 1));
    const legacyStreak = clampInteger(safeLocalStorage((storage) => storage.getItem(LEGACY_KEYS.streak), 0), 0);
    const legacyDate = safeLocalStorage((storage) => storage.getItem(LEGACY_KEYS.lastTaskDate), null);

    return normalizeState({
        tasks: migratedTasks,
        xp: legacyXp,
        level: legacyLevel,
        streak: legacyStreak,
        lastTaskDate: legacyDate,
        lifetimeCompleted: migratedTasks.filter((task) => task.completed).length,
        lifetimeXp: legacyXp + Math.max(0, legacyLevel - 1) * XP_PER_LEVEL
    });
}

function saveState() {
    const saved = safeLocalStorage((storage) => {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    }, false);

    if (!saved) showToast("⚠️ Browser storage is unavailable. Changes may be lost on reload.");
}

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function getTodayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDayDifference(fromKey, toKey) {
    if (!fromKey || !toKey) return Infinity;
    const from = new Date(`${fromKey}T00:00:00`);
    const to = new Date(`${toKey}T00:00:00`);
    return Math.round((to - from) / 86400000);
}

function updateStreak() {
    const today = getTodayKey();
    const lastDate = state.lastTaskDate;

    if (lastDate !== today) {
        state.streak = getDayDifference(lastDate, today) === 1 ? state.streak + 1 : 1;
        state.lastTaskDate = today;
    }

    state.completionDays[today] = (state.completionDays[today] || 0) + 1;
    streakEl.textContent = state.streak;
}

function updateLevel() {
    let leveledUp = false;

    while (state.xp >= XP_PER_LEVEL) {
        state.xp -= XP_PER_LEVEL;
        state.level += 1;
        leveledUp = true;
    }

    if (leveledUp) showToast(`🎉 Level ${state.level} unlocked!`);

    xpEl.textContent = state.xp;
    levelEl.textContent = state.level;
    maxXpEl.textContent = XP_PER_LEVEL;

    const percent = Math.min((state.xp / XP_PER_LEVEL) * 100, 100);
    progressBar.style.width = `${percent}%`;
    progressContainer.setAttribute("aria-valuenow", String(Math.round(percent)));
}

function getVisibleTasks() {
    const normalizedSearch = searchQuery.toLocaleLowerCase();
    const today = getTodayKey();

    const filtered = state.tasks.filter((task) => {
        const matchesSearch = !normalizedSearch || task.text.toLocaleLowerCase().includes(normalizedSearch);
        const matchesFilter = activeFilter === "all"
            || (activeFilter === "active" && !task.completed)
            || (activeFilter === "completed" && task.completed)
            || (activeFilter === "high" && task.priority === "high" && !task.completed);
        return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
        switch (taskSort.value) {
            case "priority":
                return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt - a.createdAt;
            case "deadline": {
                const aDate = a.dueDate || "9999-12-31";
                const bDate = b.dueDate || "9999-12-31";
                return aDate.localeCompare(bDate) || Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt;
            }
            case "alphabetical":
                return a.text.localeCompare(b.text, undefined, { sensitivity: "base" });
            default:
                return b.createdAt - a.createdAt;
        }
    });
}

function isOverdue(task) {
    return Boolean(task.dueDate && !task.completed && task.dueDate < getTodayKey());
}

function formatDueDate(dateKey) {
    if (!dateKey) return "";
    const date = new Date(`${dateKey}T00:00:00`);
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""} priority-${task.priority}`;

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `${task.completed ? "Restore" : "Complete"} ${task.text}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const emoji = document.createElement("span");
    emoji.className = "task-emoji";
    emoji.textContent = task.emoji;
    emoji.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");
    content.className = "task-content";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priority = document.createElement("span");
    priority.className = `priority-badge ${task.priority}`;
    priority.textContent = PRIORITY_LABELS[task.priority];

    meta.appendChild(priority);

    if (task.dueDate) {
        const due = document.createElement("span");
        due.className = `due-badge ${isOverdue(task) ? "overdue" : ""}`;
        due.textContent = `${isOverdue(task) ? "⚠️ Overdue" : "📅 " + formatDueDate(task.dueDate)}`;
        meta.appendChild(due);
    }

    content.append(text, meta);
    left.append(checkbox, emoji, content);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "✏️";
    editButton.title = "Edit task";
    editButton.setAttribute("aria-label", `Edit ${task.text}`);
    editButton.addEventListener("click", () => editTask(task.id));

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "complete-btn";
    completeButton.textContent = task.completed ? "↩" : "✓";
    completeButton.title = task.completed ? "Mark as active" : "Complete task";
    completeButton.setAttribute("aria-label", completeButton.title);
    completeButton.addEventListener("click", () => toggleTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "🗑";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(editButton, completeButton, deleteButton);
    li.append(left, actions);
    return li;
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();
    taskList.replaceChildren(...visibleTasks.map(createTaskElement));

    const total = state.tasks.length;
    const completed = state.tasks.filter((task) => task.completed).length;
    const active = total - completed;
    const overdue = state.tasks.filter(isOverdue).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
    overdueTasksEl.textContent = overdue;
    lifetimeCompletedEl.textContent = state.lifetimeCompleted;

    taskSummary.textContent = total === 0
        ? "No tasks yet."
        : `${active} active · ${completed} completed${overdue ? ` · ${overdue} overdue` : ""}`;

    emptyTasks.hidden = total > 0;
    noResults.hidden = total === 0 || visibleTasks.length > 0;
    clearCompletedBtn.disabled = completed === 0;

    updateLevel();
    updateChart();
    updateAchievements();
    saveState();
}

function drawChart() {
    if (!chartCanvas) return;

    const completed = state.tasks.filter((task) => task.completed).length;
    const active = state.tasks.length - completed;
    const total = completed + active;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    chartPercent.textContent = `${percent}%`;

    const context = chartCanvas.getContext("2d");
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const width = chartCanvas.clientWidth || 320;
    const height = chartCanvas.clientHeight || 280;
    chartCanvas.width = width * ratio;
    chartCanvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.34;
    const lineWidth = Math.max(18, radius * 0.25);
    const start = -Math.PI / 2;
    const completeAngle = total ? (completed / total) * Math.PI * 2 : 0;

    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.strokeStyle = "rgba(255,255,255,0.08)";
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();

    if (total) {
        context.strokeStyle = "#ff9d21";
        context.beginPath();
        context.arc(centerX, centerY, radius, start, start + completeAngle);
        context.stroke();
    }
}

function updateChart() {
    drawChart();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        showToast("✏️ Enter a task first.");
        taskInput.focus();
        return;
    }

    state.tasks.unshift({
        id: createId(),
        text: text.slice(0, MAX_TASK_LENGTH),
        emoji: taskEmoji.value,
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
        completed: false,
        createdAt: Date.now(),
        completedAt: null
    });

    taskInput.value = "";
    taskDueDate.value = "";
    taskPriority.value = "medium";
    showToast("✅ Task added");
    renderTasks();
    taskInput.focus();
}

function toggleTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;

    if (!task.completed) {
        task.completed = true;
        task.completedAt = Date.now();
        state.xp += XP_REWARD;
        state.lifetimeXp += XP_REWARD;
        state.lifetimeCompleted += 1;
        updateStreak();
        showToast("🎉 Task completed · +10 XP");
    } else {
        task.completed = false;
        task.completedAt = null;
        showToast("↩ Task marked active");
    }

    renderTasks();
}

function editTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;

    const nextText = window.prompt("Edit task", task.text);
    if (nextText === null) return;

    const text = nextText.trim();
    if (!text) {
        showToast("❌ Task cannot be empty.");
        return;
    }

    task.text = text.slice(0, MAX_TASK_LENGTH);
    showToast("✏️ Task updated");
    renderTasks();
}

function deleteTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;

    state.tasks = state.tasks.filter((item) => item.id !== id);
    showToast("🗑 Task deleted");
    renderTasks();
}

function clearCompleted() {
    const count = state.tasks.filter((task) => task.completed).length;
    if (!count) return;

    state.tasks = state.tasks.filter((task) => !task.completed);
    showToast(`🧹 Removed ${count} completed task${count === 1 ? "" : "s"}`);
    renderTasks();
}

function updateAchievements() {
    const unlocks = {
        firstTask: state.lifetimeCompleted >= 1,
        tenTasks: state.lifetimeCompleted >= 10,
        levelFive: state.level >= 5,
        twentyFive: state.lifetimeCompleted >= 25,
        hundredXp: state.lifetimeXp >= 100,
        perfectDay: Object.values(state.completionDays).some((count) => count >= 5)
    };

    for (const [id, unlocked] of Object.entries(unlocks)) {
        const element = document.getElementById(id);
        element.classList.toggle("locked", !unlocked);
        element.setAttribute("aria-label", unlocked ? "Achievement unlocked" : "Achievement locked");
    }
}

function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
    renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
clearCompletedBtn.addEventListener("click", clearCompleted);
taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});
taskSearch.addEventListener("input", () => {
    searchQuery = taskSearch.value.trim();
    renderTasks();
});
taskSort.addEventListener("change", renderTasks);
filterButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
window.addEventListener("resize", drawChart);

streakEl.textContent = state.streak;
renderTasks();
