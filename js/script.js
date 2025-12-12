// ===========================
// Data Management
// ===========================

class TaskManager {
    constructor() {
        this.checkAuth();
        this.tasks = this.loadTasks();
        this.searchQuery = '';
        this.filterPriority = 'all';
        this.init();
    }

    init() {
        this.loadTheme();

        // Only run dashboard logic if dashboard elements exist
        if (document.getElementById('dashboard-section')) {
            this.renderDashboard();
            this.renderAllTasks();
            this.renderTimetable();
            this.setupEventListeners();
        }
    }

    // Auth
    checkAuth() {
        // If we are on dashboard, check for user
        const isDashboard = window.location.pathname.includes('dashboard.html');
        const user = localStorage.getItem('myStudyPlanUser');

        if (isDashboard && !user) {
            window.location.href = 'index.html';
        }
    }

    login(email) {
        if (!email) return;
        localStorage.setItem('myStudyPlanUser', email);
        window.location.href = 'dashboard.html';
    }

    logout() {
        localStorage.removeItem('myStudyPlanUser');
        window.location.href = 'index.html';
    }

    // LocalStorage Operations
    loadTasks() {
        const currentUser = localStorage.getItem('myStudyPlanUser');
        if (!currentUser) return [];

        const tasks = localStorage.getItem(`myStudyPlanTasks_${currentUser}`);
        return tasks ? JSON.parse(tasks) : [];
    }

    saveTasks() {
        const currentUser = localStorage.getItem('myStudyPlanUser');
        if (currentUser) {
            localStorage.setItem(`myStudyPlanTasks_${currentUser}`, JSON.stringify(this.tasks));
        }
    }

    loadTheme() {
        const theme = localStorage.getItem('myStudyPlanTheme') || 'dark';
        const checkbox = document.getElementById('themeToggleCheckbox');

        // Default is Dark. If "light" is saved:
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (checkbox) checkbox.checked = true;
        } else {
            if (checkbox) checkbox.checked = false;
        }
    }

    toggleTheme() {
        // Toggle logic based on checkbox state
        const checkbox = document.getElementById('themeToggleCheckbox');

        if (checkbox.checked) {
            document.body.classList.add('light-mode');
            localStorage.setItem('myStudyPlanTheme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('myStudyPlanTheme', 'dark');
        }
    }

    // Task CRUD Operations
    addTask(taskData) {
        if (this.currentEditId) {
            this.updateTask(taskData);
            return;
        }

        const task = {
            id: Date.now().toString(),
            subject: taskData.subject,
            topic: taskData.topic,
            duration: parseFloat(taskData.duration),
            priority: taskData.priority,
            deadline: taskData.deadline,
            startDate: taskData.startDate || new Date(new Date(taskData.deadline).getTime() - (parseFloat(taskData.duration) * 60 * 60 * 1000)).toISOString(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderAll();
        this.showToast('Task added successfully!');
    }

    updateTask(taskData) {
        const index = this.tasks.findIndex(t => t.id === this.currentEditId);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                subject: taskData.subject,
                topic: taskData.topic,
                duration: parseFloat(taskData.duration),
                priority: taskData.priority,
                deadline: taskData.deadline,
                startDate: new Date(new Date(taskData.deadline).getTime() - (parseFloat(taskData.duration) * 60 * 60 * 1000)).toISOString()
            };
            this.saveTasks();
            this.renderAll();
            this.showToast('Task updated successfully!');
        }
        this.currentEditId = null;
    }

    deleteTask(id) {
        this.taskToDeleteId = id;
        document.getElementById('deleteConfirmModal').classList.add('active');
    }

    confirmDeleteTask() {
        if (this.taskToDeleteId) {
            this.tasks = this.tasks.filter(task => task.id !== this.taskToDeleteId);
            this.saveTasks();
            this.renderAll();
            this.showToast('Task deleted successfully!');
            this.taskToDeleteId = null;
            document.getElementById('deleteConfirmModal').classList.remove('active');

            // Also close view modal if open
            document.getElementById('viewTaskModal').classList.remove('active');
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderAll();
            this.showToast(task.completed ? 'Task completed! 🎉' : 'Task marked as pending');
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.currentEditId = id;
            this.openModal(task);
        }
    }

    renderAll() {
        this.renderDashboard();
        this.renderAllTasks();
        this.renderTimetable();
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
        // Filter tasks
        let filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                task.topic.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesPriority = this.filterPriority === 'all' || task.priority === this.filterPriority;
            return matchesSearch && matchesPriority;
        });

        // Sort by deadline (upcoming first), then by priority
        const sortedTasks = filteredTasks.sort((a, b) => {
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
                        <button class="task-btn" onclick="taskManager.editTask('${task.id}')" aria-label="Edit task">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
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
        // 8 AM to 6 PM (18:00)
        const hours = Array.from({ length: 11 }, (_, i) => i + 8);

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
                html += `<div class="timetable-cell">`;

                tasksForSlot.forEach(task => {
                    const deadline = new Date(task.deadline);
                    const isUpcoming = !task.completed; // Simplified highlight logic

                    html += `
                        <div class="timetable-task ${isUpcoming ? 'highlight' : ''}" 
                             onclick="taskManager.openViewTaskModal('${task.id}')"
                             title="${this.escapeHtml(task.subject)}: ${this.escapeHtml(task.topic)}">
                            ${this.escapeHtml(task.subject)}
                        </div>`;
                });

                html += `</div>`;
            }
        });

        timetable.innerHTML = html;
    }

    getTasksForTimeSlot(dayOfWeek, hour) {
        return this.tasks.filter(task => {
            if (task.completed) return false;

            const deadline = new Date(task.deadline);
            // End time is the deadline
            const endTime = deadline.getTime();
            // Start time is deadline - duration (hours converted to ms)
            const startTime = endTime - (task.duration * 60 * 60 * 1000);

            // Current slot time calculation
            // We need to map "DayOfWeek + Hour" to a concrete timestamp for this week?
            // "Weekly Timetable" usually implies a generic week or "This Week".
            // Since tasks have specific dates, we should only show tasks that fall in THIS week?
            // Or just map based on Day Index ignoring the specific Date (recurring-ish)?
            // The prompt asks for "Timetable", usually implies specific dates in a productivity app.

            // Let's match the DAY index of the task. 
            // If a task covers Mon-Wed, it should show on Mon, Tue, Wed.

            // To properly check if "This Slot" is inside "Task Range":
            // We need to know the date of "This Slot".
            // Let's assume the timetable shows the Current Week (Mon-Sun).

            const now = new Date();
            const currentDayIndex = now.getDay() || 7; // 1-7

            // Calculate the date for the column 'dayOfWeek'
            // date = now - (current - target) * days
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() - (currentDayIndex - dayOfWeek));
            targetDate.setHours(hour, 0, 0, 0);

            const slotStart = targetDate.getTime();
            const slotEnd = slotStart + (60 * 60 * 1000); // 1 hour slot

            // Check overlap
            // Task: [start, end]
            // Slot: [slotStart, slotEnd]
            // Overlap if (Start < SlotEnd) and (End > SlotStart)

            return (startTime < slotEnd) && (endTime > slotStart);
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
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.closeModal();
        });

        // Delete Modal Controls
        document.getElementById('closeDeleteModal').addEventListener('click', () => {
            document.getElementById('deleteConfirmModal').classList.remove('active');
            this.taskToDeleteId = null;
        });
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            document.getElementById('deleteConfirmModal').classList.remove('active');
            this.taskToDeleteId = null;
        });
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDeleteTask());

        // View Modal Controls
        document.getElementById('closeViewModal').addEventListener('click', () => {
            document.getElementById('viewTaskModal').classList.remove('active');
        });

        // Form Submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Sidebar Toggle (mobile)
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Profile / Logout
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.openProfileModal());
        }

        document.getElementById('closeProfileModal').addEventListener('click', () => {
            document.getElementById('profileModal').classList.remove('active');
        });
        document.getElementById('modalLogoutBtn').addEventListener('click', () => this.logout());

        // Helper: Set minimum date for deadline to today
        const deadlineInput = document.getElementById('deadline');
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        deadlineInput.setAttribute('min', today.toISOString().slice(0, 16));

        // Theme Toggle
        const themeCheckbox = document.getElementById('themeToggleCheckbox');
        if (themeCheckbox) {
            themeCheckbox.addEventListener('change', () => this.toggleTheme());
        }

        // Search & Filter
        document.getElementById('taskSearch').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderAllTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filterPriority = e.target.value;
            this.renderAllTasks();
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // AI Smart Plan
        document.getElementById('aiPlanBtn').addEventListener('click', () => this.generateSmartPlan());
        document.getElementById('closeAiModal').addEventListener('click', () => {
            document.getElementById('aiModal').classList.remove('active');
        });
        document.getElementById('aiModal').addEventListener('click', (e) => {
            if (e.target.id === 'aiModal') {
                document.getElementById('aiModal').classList.remove('active');
            }
        });
    }

    switchSection(section) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) item.classList.add('active');
        });

        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
    }

    openModal(task = null) {
        document.getElementById('taskModal').classList.add('active');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('modalTitle');

        if (task) {
            // Edit Mode
            title.textContent = 'Edit Task';
            form.subject.value = task.subject;
            form.topic.value = task.topic;
            form.duration.value = task.duration;
            form.priority.value = task.priority;
            form.deadline.value = task.deadline;
        } else {
            // Add Mode
            title.textContent = 'Add New Task';
            form.reset();
            this.currentEditId = null;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
            document.getElementById('deadline').value = tomorrow.toISOString().slice(0, 16);
        }
    }

    closeModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditId = null;
    }

    openViewTaskModal(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const modal = document.getElementById('viewTaskModal');
        const body = document.getElementById('viewTaskBody');
        const completeBtn = document.getElementById('viewCompleteBtn');
        const uncompleteBtn = document.getElementById('viewUncompleteBtn');
        const editBtn = document.getElementById('viewEditBtn');

        body.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${this.escapeHtml(task.subject)}</h4>
                <p style="color: var(--text-secondary);">${this.escapeHtml(task.topic)}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
                <div>
                    <strong>Priority:</strong> <span class="priority-badge ${task.priority}">${task.priority}</span>
                </div>
                <div>
                    <strong>Duration:</strong> ${task.duration}h
                </div>
                <div>
                    <strong>Deadline:</strong> ${this.formatDate(task.deadline)}
                </div>
                <div>
                    <strong>Status:</strong> ${task.completed ? 'Completed' : 'Pending'}
                </div>
            </div>
        `;

        // Update buttons
        if (task.completed) {
            completeBtn.style.display = 'none';
            uncompleteBtn.style.display = 'inline-block';
            uncompleteBtn.onclick = () => {
                this.toggleComplete(id);
                this.openViewTaskModal(id); // Re-render logic
            };
        } else {
            completeBtn.style.display = 'inline-block';
            uncompleteBtn.style.display = 'none';
            completeBtn.onclick = () => {
                this.toggleComplete(id);
                this.openViewTaskModal(id);
            };
        }

        editBtn.onclick = () => {
            modal.classList.remove('active');
            this.editTask(id);
        };

        modal.classList.add('active');
    }

    openProfileModal() {
        const email = localStorage.getItem('myStudyPlanUser') || 'Guest';
        document.getElementById('profileEmail').textContent = email;
        document.getElementById('profileModal').classList.add('active');
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
        // Start date handled in addTask/updateTask logic

        this.addTask(taskData);
        this.closeModal();
    }

    exportData() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'study_plan_tasks.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    generateSmartPlan() {
        const pendingTasks = this.tasks.filter(t => !t.completed);

        if (pendingTasks.length === 0) {
            this.showToast('No pending tasks to plan!');
            return;
        }

        // Heuristic Algorithm
        // Score = Priority(High=3, Med=2, Low=1) * 10 - DaysUntilDeadline
        const priorityScore = { 'high': 3, 'medium': 2, 'low': 1 };

        const rankedTasks = pendingTasks.map(task => {
            const deadline = new Date(task.deadline);
            const now = new Date();
            const hoursUntil = (deadline - now) / (1000 * 60 * 60);
            const daysUntil = hoursUntil / 24;

            let score = priorityScore[task.priority] * 10;
            if (hoursUntil < 0) score += 50; // Overdue is highest priority
            else if (hoursUntil < 24) score += 20; // Due today

            score -= daysUntil; // Closer deadline = higher score

            return { task, score };
        }).sort((a, b) => b.score - a.score);

        const topTasks = rankedTasks.slice(0, 5).map(item => item.task);

        this.renderTaskList('aiPlanList', topTasks);
        document.getElementById('aiModal').classList.add('active');
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
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
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
// AI Assistant
// ===========================

class AiAssistant {
    constructor() {
        this.isOpen = false;
        this.chatToggle = document.getElementById('chatToggle');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatClose = document.getElementById('chatClose');
        this.chatForm = document.getElementById('chatForm');
        this.chatInput = document.getElementById('chatInput');
        this.chatMessages = document.getElementById('chatMessages');

        this.init();
    }

    init() {
        if (!this.chatToggle) return;

        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.chatClose.addEventListener('click', () => this.toggleChat());
        this.chatForm.addEventListener('submit', (e) => this.handleMessage(e));
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('active', this.isOpen);
        if (this.isOpen) {
            this.chatInput.focus();
        }
    }

    handleMessage(e) {
        e.preventDefault();
        const text = this.chatInput.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        this.chatInput.value = '';

        // Simulate AI thinking and response
        setTimeout(() => {
            const response = this.generateResponse(text);
            this.addMessage(response, 'ai');
        }, 600);
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        div.textContent = text;
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    generateResponse(text) {
        const lower = text.toLowerCase();

        if (lower.includes('hello') || lower.includes('hi')) {
            return "Hello! I'm here to help you study. Try asking for a plan or advice on a subject.";
        }
        if (lower.includes('plan') || lower.includes('schedule')) {
            return "I can help you plan! Check out the Smart Plan feature in the dashboard, or tell me what subjects you have pending.";
        }
        if (lower.includes('math') || lower.includes('calculus')) {
            return "Math requires practice! I suggest breaking down problems into smaller steps and setting a timer for 25 minutes (Pomodoro technique).";
        }
        if (lower.includes('tired') || lower.includes('break')) {
            return "It's important to rest! Take a 5-10 minute break. Stretch, drink water, or walk around.";
        }
        if (lower.includes('thank')) {
            return "You're welcome! Keep up the good work.";
        }

        const genericResponses = [
            "That sounds important. Have you broken it down into smaller tasks?",
            "Make sure to prioritize your most urgent deadlines first.",
            "Remember to stay hydrated while studying!",
            "I've noted that. Is there anything else you need help organizing?"
        ];

        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
}

// ===========================
// Initialize Application
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Assign to window to ensure access from inline HTML event handlers
    window.taskManager = new TaskManager();
    window.aiAssistant = new AiAssistant();

    // Handle Login Form if present
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('userEmail').value;
            window.taskManager.login(email);
        });
    }
});
