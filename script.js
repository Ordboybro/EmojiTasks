const taskInput = document.getElementById("taskInput");
const taskEmoji = document.getElementById("taskEmoji");
const addTaskBtn = document.getElementById("addTaskBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const taskList = document.getElementById("taskList");
const emptyTasks = document.getElementById("emptyTasks");
const taskSummary = document.getElementById("taskSummary");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const activeTasksEl = document.getElementById("activeTasks");

const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const maxXpEl = document.getElementById("maxXp");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.querySelector(".progress-container");
const streakEl = document.getElementById("streak");

const chartCanvas = document.getElementById("progressChart");
const chartFallback = document.getElementById("chartFallback");
const toast = document.getElementById("toast");

const XP_PER_LEVEL = 100;
const XP_REWARD = 10;
const MAX_TASK_LENGTH = 200;
const STORAGE_KEYS = {
    tasks: "emojiTasks",
    xp: "emojiXP",
    level: "emojiLevel",
    streak: "emojiStreak",
    lastTaskDate: "lastTaskDate"
};

let tasks = loadTasks();
let xp = loadNumber(STORAGE_KEYS.xp);
let level = Math.max(1, loadNumber(STORAGE_KEYS.level, 1));
let streak = loadNumber(STORAGE_KEYS.streak);
let chart = null;
let toastTimer = null;

function createId() {
    if (typeof crypto?.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadNumber(key, fallback = 0) {
    try {
        const value = Number(localStorage.getItem(key));
        return Number.isFinite(value) && value >= 0 ? value : fallback;
    } catch {
        return fallback;
    }
}

function loadTasks() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks));

        if (!Array.isArray(stored)) return [];

        return stored
            .filter((task) => task && typeof task === "object")
            .map((task) => ({
                id: String(task.id ?? createId()),
                text: typeof task.text === "string" ? task.text.slice(0, MAX_TASK_LENGTH) : "",
                emoji: typeof task.emoji === "string" ? task.emoji : "📝",
                completed: Boolean(task.completed)
            }))
            .filter((task) => task.text.trim());
    } catch {
        return [];
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.xp, String(xp));
        localStorage.setItem(STORAGE_KEYS.level, String(level));
        localStorage.setItem(STORAGE_KEYS.streak, String(streak));
    } catch {
        showToast("⚠️ Browser storage is unavailable.");
    }
}

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
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
    const lastDate = localStorage.getItem(STORAGE_KEYS.lastTaskDate);

    if (lastDate === today) {
        streakEl.textContent = streak;
        return;
    }

    const difference = getDayDifference(lastDate, today);
    streak = difference === 1 ? streak + 1 : 1;

    try {
        localStorage.setItem(STORAGE_KEYS.lastTaskDate, today);
        localStorage.setItem(STORAGE_KEYS.streak, String(streak));
    } catch {
        // The current streak remains available in memory for this session.
    }

    streakEl.textContent = streak;
}

function updateLevel() {
    const previousLevel = level;

    while (xp >= XP_PER_LEVEL) {
        xp -= XP_PER_LEVEL;
        level += 1;
    }

    if (level > previousLevel) {
        showToast(`🎉 Level ${level} unlocked!`);
    }

    xpEl.textContent = xp;
    levelEl.textContent = level;
    maxXpEl.textContent = XP_PER_LEVEL;

    const percent = Math.min((xp / XP_PER_LEVEL) * 100, 100);
    progressBar.style.width = `${percent}%`;
    progressContainer.setAttribute("aria-valuenow", String(Math.round(percent)));
}

function updateChart() {
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.length - completed;

    if (!window.Chart || !chartCanvas) {
        chartFallback.hidden = false;
        chartCanvas.hidden = true;
        return;
    }

    chartFallback.hidden = true;
    chartCanvas.hidden = false;

    if (!chart) {
        chart = new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels: ["Completed", "Active"],
                datasets: [{
                    data: [completed, active],
                    backgroundColor: ["#2ecc71", "#ff8c00"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: "#ffffff" }
                    }
                }
            }
        });
        return;
    }

    chart.data.datasets[0].data = [completed, active];
    chart.update();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
    taskSummary.textContent = total === 0
        ? "No tasks yet."
        : `${active} active · ${completed} completed`;

    emptyTasks.hidden = total > 0;
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = task.completed ? "task completed" : "task";

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const emoji = document.createElement("span");
    emoji.className = "task-emoji";
    emoji.textContent = task.emoji;
    emoji.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    left.append(checkbox, emoji, text);

    const actions = document.createElement("div");
    actions.className = "actions";

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
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(completeButton, deleteButton);
    li.append(left, actions);

    return li;
}

function renderTasks() {
    taskList.replaceChildren(...tasks.map(createTaskElement));
    updateStats();
    updateLevel();
    updateChart();
    checkAchievements();
    saveData();
}

function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        showToast("✏️ Enter a task first.");
        taskInput.focus();
        return;
    }

    if (text.length > MAX_TASK_LENGTH) {
        showToast(`Task is limited to ${MAX_TASK_LENGTH} characters.`);
        return;
    }

    tasks.unshift({
        id: createId(),
        text,
        emoji: taskEmoji.value,
        completed: false
    });

    taskInput.value = "";
    showToast("✅ Task added");
    saveData();
    renderTasks();
    taskInput.focus();
}

function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (!task.completed) {
        xp += XP_REWARD;
        updateStreak();
        showToast("🎉 Task completed +10 XP");
    } else {
        showToast("↩ Task marked active");
    }

    task.completed = !task.completed;
    saveData();
    renderTasks();
}

function deleteTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    tasks = tasks.filter((item) => item.id !== id);
    saveData();
    renderTasks();
    showToast("🗑 Task deleted");
}

function clearCompleted() {
    const completedCount = tasks.filter((task) => task.completed).length;

    if (completedCount === 0) {
        showToast("There are no completed tasks.");
        return;
    }

    tasks = tasks.filter((task) => !task.completed);
    saveData();
    renderTasks();
    showToast(`🧹 Removed ${completedCount} completed task${completedCount === 1 ? "" : "s"}`);
}

function checkAchievements() {
    const completed = tasks.filter((task) => task.completed).length;

    document.getElementById("firstTask").classList.toggle("locked", completed < 1);
    document.getElementById("tenTasks").classList.toggle("locked", completed < 10);
    document.getElementById("levelFive").classList.toggle("locked", level < 5);
}

addTaskBtn.addEventListener("click", addTask);
clearCompletedBtn.addEventListener("click", clearCompleted);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});

streakEl.textContent = streak;
renderTasks();