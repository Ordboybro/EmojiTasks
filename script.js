const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const activeTasksEl = document.getElementById("activeTasks");

const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const progressBar = document.getElementById("progressBar");

let tasks = JSON.parse(localStorage.getItem("emojiTasks")) || [];

let xp = Number(localStorage.getItem("emojiXP")) || 0;
let level = Number(localStorage.getItem("emojiLevel")) || 1;

let streak =
    Number(localStorage.getItem("emojiStreak"))
    || 0;

const XP_PER_LEVEL = 100;
const XP_REWARD = 10;

const chartCanvas =
document.getElementById("progressChart");

const chart = new Chart(chartCanvas, {

    type: "doughnut",

    data: {

        labels: [
            "Completed",
            "Active"
        ],

        datasets: [{

            data: [0, 0],

            backgroundColor: [
                "#2ecc71",
                "#ff8c00"
            ]
        }]
    }
});

function showToast(text) {

    const toast =
        document.getElementById("toast");

    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}

function saveData() {
    localStorage.setItem("emojiTasks", JSON.stringify(tasks));
    localStorage.setItem("emojiXP", xp);
    localStorage.setItem("emojiLevel", level);
}

function updateStreak() {

    const today =
        new Date().toDateString();

    const lastDate =
        localStorage.getItem("lastTaskDate");

    if(lastDate !== today){

        streak++;

        localStorage.setItem(
            "lastTaskDate",
            today
        );

        localStorage.setItem(
            "emojiStreak",
            streak
        );
    }

    document
        .getElementById("streak")
        .textContent = streak;
}

function updateLevel() {
    while (xp >= XP_PER_LEVEL) {
        xp -= XP_PER_LEVEL;
        level++;

        showLevelUp();
    }

    xpEl.textContent = xp;
    levelEl.textContent = level;

    const percent = (xp / XP_PER_LEVEL) * 100;
    progressBar.style.width = `${percent}%`;
}

function showLevelUp() {

    showToast(
        `🎉 Level ${level} unlocked!`
    );
}

function updateChart() {

    const completed =
        tasks.filter(
            t => t.completed
        ).length;

    const active =
        tasks.length - completed;

    chart.data.datasets[0].data = [
        completed,
        active
    ];

    chart.update();
}

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
}

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const li = document.createElement("li");

        li.className = task.completed
            ? "task completed"
            : "task";

        li.innerHTML = `
            <div class="task-left">

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                >

                <span class="task-text">
                    ${task.text}
                </span>

            </div>

            <div class="actions">

                <button class="complete-btn">
                    ✓
                </button>

                <button class="delete-btn">
                    🗑
                </button>

            </div>
        `;

        const checkbox =
            li.querySelector(".task-checkbox");

        const completeBtn =
            li.querySelector(".complete-btn");

        const deleteBtn =
            li.querySelector(".delete-btn");

        checkbox.addEventListener(
            "change",
            () => toggleTask(task.id)
        );

        completeBtn.addEventListener(
            "click",
            () => toggleTask(task.id)
        );

        deleteBtn.addEventListener(
            "click",
            () => deleteTask(task.id)
        );

        taskList.appendChild(li);
    });

    updateStats();
    updateLevel();
    updateChart();
    checkAchievements();
}

function addTask() {

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.unshift({
        id: Date.now(),
        text,
        completed: false
    });

    taskInput.value = "";

    showToast("✅ Task added");

    showToast("🗑 Task deleted");

    saveData();
    renderTasks();
}

function toggleTask(id) {

    const task = tasks.find(
        t => t.id === id
    );

    if (!task) return;

if (!task.completed) {

    xp += XP_REWARD;

    updateStreak();
}

    task.completed = !task.completed;

    saveData();
    renderTasks();
}

function checkAchievements() {

    const completed =
        tasks.filter(t => t.completed).length;

    if(completed >= 1){
        document
        .getElementById("firstTask")
        .classList.remove("locked");
    }

    if(completed >= 10){
        document
        .getElementById("tenTasks")
        .classList.remove("locked");
    }

    if(level >= 5){
        document
        .getElementById("levelFive")
        .classList.remove("locked");
    }
}

function deleteTask(id) {

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveData();
    renderTasks();
}

addTaskBtn.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keydown",
    e => {
        if (e.key === "Enter") {
            addTask();
        }
    }
);

updateStreak();
renderTasks();