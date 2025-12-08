// ===========================
// Data Management
// ===========================

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.renderDashboard();
        this.renderAllTasks();
        this.renderTimetable();
        this.setupEventListeners();
    }

    // LocalStorage Operations
    loadTasks() {
        const tasks = localStorage.getItem('myStudyPlanTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    saveTasks() {
        localStorage.setItem('myStudyPlanTasks', JSON.stringify(this.tasks));
    }

    // Task CRUD Operations
    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            subject: taskData.subject,
            topic: taskData.topic,
            duration: parseFloat(taskData.duration),
            priority: taskData.priority,
            deadline: taskData.deadline,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderDashboard();
        this.renderAllTasks();
        this.renderTimetable();
        this.showToast('Task added successfully!');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderDashboard();
        this.renderAllTasks();
        this.renderTimetable();
        this.showToast('Task deleted successfully!');
    }

    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderDashboard();
            this.renderAllTasks();
            this.renderTimetable();
            this.showToast(task.completed ? 'Task completed! 🎉' : 'Task marked as pending');
        }
    }

    // Statistics Calculations
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const totalHours = this.tasks.reduce((sum, t) => sum + t.duration, 0);
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, pending, totalHours, completionPercentage };
    }

    // Render Methods
    renderDashboard() {
        const stats = this.getStats();

        // Update statistics
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('totalHours').textContent = stats.totalHours.toFixed(1);

        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        progressBar.style.width = `${stats.completionPercentage}%`;
        progressText.textContent = `${stats.completionPercentage}% Complete`;

        // Render recent tasks (last 5)
        const recentTasks = [...this.tasks]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.renderTaskList('recentTasksList', recentTasks);
    }

    renderAllTasks() {
        // Sort by deadline (upcoming first), then by priority
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            const dateA = new Date(a.deadline);
            const dateB = new Date(b.deadline);
            return dateA - dateB;
        });

        this.renderTaskList('allTasksList', sortedTasks);
    }

    renderTaskList(containerId, tasks) {
        const container = document.getElementById(containerId);

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 11l3 3L22 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/>
                    </svg>
                    <h3>No tasks yet</h3>
                    <p>Add your first study task to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
    }

    createTaskCard(task) {
        const deadline = new Date(task.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0 && !task.completed;

        return `
            <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-header">
                    <div class="task-title-group">
                        <h4>${this.escapeHtml(task.subject)}</h4>
                        <p class="task-topic">${this.escapeHtml(task.topic)}</p>
                    </div>
                    <div class="task-actions">
                        <button class="task-btn complete-btn" onclick="taskManager.toggleComplete('${task.id}')" aria-label="Toggle complete">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                ${task.completed
                ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-width="2"/><path d="M22 4L12 14.01l-3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                : '<circle cx="12" cy="12" r="10" stroke-width="2"/>'
            }
                            </svg>
                        </button>
                        <button class="task-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')" aria-label="Delete task">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <div class="task-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        ${task.duration}h
                    </div>
                    <div class="task-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        ${this.formatDate(task.deadline)}
                        ${isOverdue ? '<span style="color: var(--priority-high);">(Overdue)</span>' :
                daysUntil === 0 ? '<span style="color: var(--priority-medium);">(Today)</span>' :
                    daysUntil === 1 ? '<span style="color: var(--priority-medium);">(Tomorrow)</span>' :
                        daysUntil > 0 && daysUntil <= 3 ? `<span style="color: var(--priority-medium);">(${daysUntil} days)</span>` : ''}
                    </div>
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                </div>
            </div>
        `;
    }

    renderTimetable() {
        const timetable = document.getElementById('timetable');
        const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

        let html = '';

        // Header row
        days.forEach(day => {
            html += `<div class="timetable-cell timetable-header">${day}</div>`;
        });

        // Time slots
        hours.forEach(hour => {
            // Time column
            html += `<div class="timetable-cell timetable-time">${this.formatHour(hour)}</div>`;

            // Day columns
            for (let day = 1; day <= 7; day++) {
                const tasksForSlot = this.getTasksForTimeSlot(day, hour);
                if (tasksForSlot.length > 0) {
                    const task = tasksForSlot[0];
                    html += `<div class="timetable-cell">
                        <div class="timetable-task" title="${this.escapeHtml(task.subject)}: ${this.escapeHtml(task.topic)}">
                            ${this.escapeHtml(task.subject)}
                        </div>
                    </div>`;
                } else {
                    html += `<div class="timetable-cell"></div>`;
                }
            }
        });

        timetable.innerHTML = html;
    }

    getTasksForTimeSlot(dayOfWeek, hour) {
        // Simple algorithm: distribute tasks across the week based on deadline
        return this.tasks.filter(task => {
            if (task.completed) return false;

            const deadline = new Date(task.deadline);
            const taskDay = deadline.getDay() || 7; // Convert Sunday (0) to 7
            const taskHour = deadline.getHours();

            return taskDay === dayOfWeek && Math.abs(taskHour - hour) <= 1;
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Add Task Buttons
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
        document.getElementById('addTaskBtn2').addEventListener('click', () => this.openModal());

        // Modal Controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());

        // Close modal on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });

        // Form Submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Sidebar Toggle (mobile)
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Set minimum date for deadline to today
        const deadlineInput = document.getElementById('deadline');
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.setAttribute('min', today);
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
    }

    openModal() {
        document.getElementById('taskModal').classList.add('active');
        document.getElementById('taskForm').reset();

        // Set default deadline to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];
    }

    closeModal() {
        document.getElementById('taskModal').classList.remove('active');
    }

    handleFormSubmit(e) {
        const formData = new FormData(e.target);
        const taskData = {
            subject: formData.get('subject'),
            topic: formData.get('topic'),
            duration: formData.get('duration'),
            priority: formData.get('priority'),
            deadline: formData.get('deadline')
        };

        this.addTask(taskData);
        this.closeModal();
    }

    // Utility Methods
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatHour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour} ${period}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===========================
// Initialize Application
// ===========================

let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
