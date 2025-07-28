const SUPABASE_URL = 'https://ahlqtbmmvefgwjhbrcpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF0Ym1tdmVmZ3dqaGJyY3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NDEwNjMsImV4cCI6MjA2ODAxNzA2M30.ebIpSg8WsdWTf-JDhTCkRRVYKfjOYryxKt9iGm0XsNw';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Task Tracker JavaScript - Minimalist Version

class TaskTracker {
    constructor() {
        // Password protection
        this.password = 'your-password-here'; // Change this to your desired password
        this.isAuthenticated = false;
        
        // Check if already authenticated
        if (sessionStorage.getItem('taskTrackerAuthenticated') === 'true') {
            this.isAuthenticated = true;
            this.initializeApp();
            this.showApp();
        } else {
            this.showPasswordScreen();
        }
    }

    initializeApp() {
        // Clear localStorage to ensure new colors are applied
        // localStorage.removeItem('habits'); // Removed as per instructions
        
        // this.habits = JSON.parse(localStorage.getItem('habits')) || []; // Removed as per instructions
        this.editingTaskId = null;
        this.habitCounter = 0; // Track task count for color assignment
        
        // New color palette
        this.colorPalette = [
            '#003f5c', // dark blue
            '#2f4b7c', // navy
            '#665191', // purple
            '#a05195', // magenta
            '#d45087', // pink
            '#f95d6a', // coral
            '#ff7c43', // orange
            '#ffa600'  // amber
        ];
        
        this.initializeEventListeners();
        this.updateExistingTaskColors(); // Update colors for existing tasks
        this.renderTasks();
    }

    showPasswordScreen() {
        document.getElementById('password-overlay').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('password-input').focus();
    }

    showApp() {
        document.getElementById('password-overlay').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
    }

    authenticate(password) {
        if (password === this.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('taskTrackerAuthenticated', 'true');
            this.initializeApp();
            this.showApp();
            return true;
        } else {
            alert('Incorrect password'); // Replaced showNotification with alert
            return false;
        }
    }

    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('taskTrackerAuthenticated');
        this.showPasswordScreen();
    }

    initializeEventListeners() {
        // Password form submission
        const passwordForm = document.getElementById('password-form');
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('password-input').value;
            if (this.authenticate(password)) {
                document.getElementById('password-input').value = '';
            }
        });

        // Form submission for adding new tasks
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Modal functionality
        const modal = document.getElementById('edit-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Edit form submission
        const editForm = document.getElementById('edit-form');
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTaskEdit();
        });

        // Delete task button
        document.getElementById('delete-task').addEventListener('click', () => {
            this.deleteTask();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Task input functionality
        this.initializeTaskInputs();
    }

    initializeTaskInputs() {
        // Add task button functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-task-btn')) {
                const taskInputGroup = e.target.closest('.task-input-group');
                const taskInput = taskInputGroup.querySelector('.task-input');
                const taskText = taskInput.value.trim();
                
                if (taskText) {
                    const taskInputs = taskInputGroup.closest('.task-inputs');
                    this.addTaskItem(taskInputs, taskText);
                    taskInput.value = '';
                }
            }
        });

        // Enter key functionality for task inputs
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('task-input') && e.key === 'Enter') {
                e.preventDefault();
                const taskInputGroup = e.target.closest('.task-input-group');
                const taskText = e.target.value.trim();
                
                if (taskText) {
                    const taskInputs = taskInputGroup.closest('.task-inputs');
                    this.addTaskItem(taskInputs, taskText);
                    e.target.value = '';
                }
            }
        });
    }

    async addTask() {
        const nameInput = document.getElementById('task-name');
        const taskName = nameInput.value.trim();
        
        if (!taskName) return;
        
        const colorIndex = this.habitCounter % this.colorPalette.length;
        const color = this.colorPalette[colorIndex];
        const task = {
            name: taskName,
            color: color,
            completed_dates: [],
            daily_tasks: {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: []
            },
            created_at: new Date().toISOString()
        };
        
        console.log('Attempting to insert task:', task);
        console.log('Using color:', color);
        
        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('habits')
            .insert([task]);
            
        if (error) {
            console.error('Supabase error:', error);
            alert('Error adding task: ' + JSON.stringify(error, null, 2));
            return;
        }
        
        console.log('Successfully inserted task:', data);
        this.habitCounter++;
        this.renderTasks();
        this.renderTodayTasks();
        nameInput.value = '';
    }

    async updateExistingTaskColors() {
        console.log('Updating existing task colors...');
        
        const { data: tasks, error } = await supabaseClient
            .from('habits')
            .select('*');
            
        if (error) {
            console.error('Error fetching tasks for color update:', error);
            return;
        }
        
        for (const task of tasks) {
            // Check if task has old color palette
            const oldColors = ['#e78ab6', '#f4a6c1', '#fbc6e2', '#f7d1ea', '#ffc3b1', '#ffd6c3', '#ffe3d3', '#b6a6f8', '#a6a1f7', '#8883e6'];
            if (oldColors.includes(task.color)) {
                const newColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
                console.log(`Updating task "${task.name}" from ${task.color} to ${newColor}`);
                
                await supabaseClient
                    .from('habits')
                    .update({ color: newColor })
                    .eq('id', task.id);
            }
        }
        
        console.log('Color update complete');
        this.renderTasks();
        this.renderTodayTasks();
    }

    renderTodayTasks() {
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        console.log('Today is:', dayOfWeek);
        
        // Get all tasks and filter for today's tasks
        supabaseClient
            .from('habits')
            .select('*')
            .then(({ data: tasks, error }) => {
                if (error) {
                    console.error('Error fetching tasks for today:', error);
                    return;
                }
                
                console.log('All tasks:', tasks);
                
                // Filter tasks that have specific subtasks for today
                const todayTasks = tasks.filter(task => {
                    const dailyTasks = task.daily_tasks || {};
                    const todayTasks = dailyTasks[dayOfWeek] || [];
                    return todayTasks.length > 0; // Only show tasks that have subtasks for today
                });
                
                console.log(`Found ${todayTasks.length} tasks with subtasks for today (${dayOfWeek})`);
                
                const todayContainer = document.getElementById('today-tasks');
                if (!todayContainer) {
                    console.error('Today tasks container not found!');
                    return;
                }
                
                if (todayTasks.length === 0) {
                    todayContainer.innerHTML = '<div class="empty-state"><p>No tasks scheduled for today.</p></div>';
                    return;
                }
                
                let todayHTML = '<h3>Today</h3>';
                todayTasks.forEach(task => {
                    const dailyTasks = task.daily_tasks || {};
                    const todayTasks = dailyTasks[dayOfWeek] || [];
                    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
                    const isCompleted = task.completed_dates && task.completed_dates.includes(today);
                    
                    console.log(`Task "${task.name}" using color: ${task.color}`);
                    
                    todayHTML += `
                        <div class="today-task ${isCompleted ? 'completed' : ''}" style="--habit-color: ${task.color}" data-task-id="${task.id}" data-date="${today}">
                            <div class="task-header">
                                <div class="task-name">${task.name}</div>
                                <div class="task-status">
                                    ${isCompleted ? '<span class="completion-checkmark">✓</span>' : ''}
                                    <label class="task-checkbox">
                                        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}" data-date="${today}">
                                    </label>
                                </div>
                            </div>
                            <div class="task-list">
                                ${todayTasks.map(task => `<div class="task-item">• ${task}</div>`).join('')}
                            </div>
                        </div>
                    `;
                });
                
                todayContainer.innerHTML = todayHTML;
                
                // Add event listeners to checkboxes
                const checkboxes = todayContainer.querySelectorAll('input[type="checkbox"]');
                console.log(`Found ${checkboxes.length} checkboxes to add listeners to`);
                
                checkboxes.forEach(checkbox => {
                    console.log('Adding listener to checkbox:', checkbox.dataset.taskId);
                    checkbox.addEventListener('change', (e) => {
                        console.log('Checkbox clicked!', e.target.checked);
                        const taskId = e.target.dataset.taskId;
                        const date = e.target.dataset.date;
                        const isChecked = e.target.checked;
                        
                        console.log('Task ID:', taskId, 'Date:', date, 'Checked:', isChecked);
                        
                        this.toggleTaskCompletion(taskId, date);
                        
                        // Update the visual state of the calendar cell
                        const taskCards = document.querySelectorAll('.task-card');
                        for (const card of taskCards) {
                            const editBtn = card.querySelector('.edit-btn');
                            if (editBtn && editBtn.dataset.taskId === taskId) {
                                const calendarCell = card.querySelector(`.day-cell[data-date="${date}"]`);
                                if (calendarCell) {
                                    if (isChecked) {
                                        calendarCell.classList.add('completed');
                                    } else {
                                        calendarCell.classList.remove('completed');
                                    }
                                    console.log('Updated calendar cell');
                                }
                                break;
                            }
                        }
                        
                        // Update the visual state of the task item
                        const taskItem = e.target.closest('.today-task');
                        if (taskItem) {
                            if (isChecked) {
                                taskItem.classList.add('completed');
                                const statusDiv = taskItem.querySelector('.task-status');
                                if (statusDiv && !statusDiv.querySelector('.completion-checkmark')) {
                                    const checkmark = document.createElement('span');
                                    checkmark.className = 'completion-checkmark';
                                    checkmark.textContent = '✓';
                                    statusDiv.insertBefore(checkmark, statusDiv.firstChild);
                                }
                            } else {
                                taskItem.classList.remove('completed');
                                const checkmark = taskItem.querySelector('.completion-checkmark');
                                if (checkmark) {
                                    checkmark.remove();
                                }
                            }
                        }
                    });
                });
                
                // Add click handlers to the entire task items
                const taskItems = todayContainer.querySelectorAll('.today-task');
                taskItems.forEach(taskItem => {
                    taskItem.addEventListener('click', (e) => {
                        // Don't trigger if clicking on the checkbox itself
                        if (e.target.closest('.task-checkbox')) return;
                        
                        const taskId = taskItem.dataset.taskId;
                        const date = taskItem.dataset.date;
                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        const isCurrentlyChecked = checkbox.checked;
                        
                        console.log('Task item clicked!', taskId, date, 'Currently checked:', isCurrentlyChecked);
                        
                        // Toggle the checkbox
                        checkbox.checked = !isCurrentlyChecked;
                        
                        // Trigger the change event
                        checkbox.dispatchEvent(new Event('change'));
                    });
                });
            });
    }

    async renderTasks() {
        const container = document.getElementById('tasks-container');
        container.innerHTML = '';
        
        console.log('Attempting to fetch tasks from Supabase...');
        
        const { data: tasks, error } = await supabaseClient
            .from('habits')
            .select('*');
            
        if (error) {
            console.error('Error fetching tasks:', error);
            container.innerHTML = '<div class="empty-state"><p>Error loading tasks: ' + error.message + '</p></div>';
            return;
        }
        
        console.log('Successfully fetched tasks:', tasks);
        if (!tasks.length) {
            container.innerHTML = '<div class="empty-state"><p>No tasks yet. Add your first task to get started!</p></div>';
            return;
        }
        
        // Sort tasks by creation date (oldest first)
        tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        // Set the counter to the number of existing tasks
        this.habitCounter = tasks.length;
        
        tasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            container.appendChild(taskCard);
        });
        
        // Also render today's tasks
        this.renderTodayTasks();
    }

    hexToRgb(hex) {
        // Remove the # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        
        const rgbColor = this.hexToRgb(task.color);

        card.innerHTML = `
            <div class="task-header">
                <div class="task-name">${task.name}</div>
                <button class="action-btn edit-btn" data-task-id="${task.id}" title="Edit">
                    Edit
                </button>
            </div>
            <div class="monthly-calendars" style="--habit-color: ${task.color}; --habit-color-rgb: ${rgbColor}">
                ${this.generateMonthlyCalendars(task)}
            </div>
        `;

        // Add event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => {
            this.openEditModal(task);
        });

        // Add click listeners to day cells
        const dayCells = card.querySelectorAll('.day-cell:not(.future):not(.other-month)');
        dayCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const dateString = cell.dataset.date;
                this.toggleTaskCompletion(task.id, dateString);
            });
        });

        return card;
    }

    generateMonthlyCalendars(task) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let calendars = '';
        
        // Generate calendars for the preceding 2 months plus current month
        for (let i = 2; i >= 0; i--) {
            const targetMonth = currentMonth - i;
            const targetYear = currentYear;
            
            // Handle year rollover
            let month = targetMonth;
            let year = targetYear;
            if (targetMonth < 0) {
                month = 12 + targetMonth;
                year = targetYear - 1;
            }
            
            calendars += this.generateMonthCalendar(task, year, month, today);
        }
        
        return calendars;
    }

    generateMonthCalendar(task, year, month, today) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        
        // Get today's date string once to ensure consistency
        const todayString = today.toLocaleDateString('en-CA');
        
        let calendar = `
            <div class="month-calendar">
                <div class="month-header">${monthName}</div>
                <div class="calendar-grid">
        `;
        
        // Add day headers
        const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        daysOfWeek.forEach(day => {
            calendar += `<div class="day-header">${day}</div>`;
        });
        
        // Generate calendar days - only generate necessary weeks
        const endDate = new Date(lastDay);
        endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
            const isCompleted = task.completed_dates.includes(dateString);
            const isToday = dateString === todayString;
            const isFuture = dateString > todayString;
            const isOtherMonth = currentDate.getMonth() !== month;
            

            
            let classes = 'day-cell';
            if (isCompleted) classes += ' completed';
            if (isToday) classes += ' today';
            if (isFuture) classes += ' future';
            if (isOtherMonth) classes += ' other-month';
            
            calendar += `<div class="${classes}" data-date="${dateString}">${currentDate.getDate()}</div>`;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        calendar += `
                </div>
            </div>
        `;
        
        return calendar;
    }

    async toggleTaskCompletion(taskId, dateString) {
        // Fetch the task
        const { data: tasks } = await supabaseClient
            .from('habits')
            .select('*')
            .eq('id', taskId);
        const task = tasks[0];
        if (!task) return;

        let completed_dates = task.completed_dates || [];
        const isCompleted = completed_dates.includes(dateString);

        if (isCompleted) {
            completed_dates = completed_dates.filter(date => date !== dateString);
        } else {
            completed_dates.push(dateString);
        }

        // Update in Supabase
        await supabaseClient
            .from('habits')
            .update({ completed_dates })
            .eq('id', taskId);

        // Update only the visual state of the clicked date
        // Find the task card that contains the clicked cell
        const taskCards = document.querySelectorAll('.task-card');
        let clickedCell = null;
        
        for (const card of taskCards) {
            const editBtn = card.querySelector('.edit-btn');
            if (editBtn && editBtn.dataset.taskId === taskId) {
                clickedCell = card.querySelector(`.day-cell[data-date="${dateString}"]`);
                break;
            }
        }
        
        if (clickedCell) {
            if (isCompleted) {
                clickedCell.classList.remove('completed');
            } else {
                clickedCell.classList.add('completed');
            }
        }
        
        // Also update the checkbox in Today's Tasks if it's today's date
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
        if (dateString === today) {
            const todayCheckbox = document.querySelector(`input[data-task-id="${taskId}"][data-date="${today}"]`);
            if (todayCheckbox) {
                todayCheckbox.checked = !isCompleted;
            }
        }
    }

    openEditModal(task) {
        this.editingTaskId = task.id;
        
        document.getElementById('edit-task-name').value = task.name;
        
        // Populate daily tasks
        const dailyTasks = task.daily_tasks || {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const taskInputs = document.querySelector(`[data-day="${day}"]`);
            if (taskInputs) {
                // Clear existing tasks
                const existingTasks = taskInputs.querySelectorAll('.task-item-edit');
                existingTasks.forEach(task => task.remove());
                
                // Add existing tasks
                const tasks = dailyTasks[day] || [];
                tasks.forEach(task => {
                    this.addTaskItem(taskInputs, task);
                });
            }
        });
        
        document.getElementById('edit-modal').style.display = 'block';
    }

    addTaskItem(container, taskText = '') {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item-edit';
        taskItem.innerHTML = `
            <span>${taskText}</span>
            <button type="button" class="remove-task-btn">×</button>
        `;
        
        // Add remove functionality
        taskItem.querySelector('.remove-task-btn').addEventListener('click', () => {
            taskItem.remove();
        });
        
        container.appendChild(taskItem);
    }

    async saveTaskEdit() {
        if (!this.editingTaskId) return;
        
        const taskName = document.getElementById('edit-task-name').value.trim();
        if (!taskName) return;
        
        // Collect daily tasks
        const dailyTasks = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const taskInputs = document.querySelector(`[data-day="${day}"]`);
            if (taskInputs) {
                const tasks = [];
                taskInputs.querySelectorAll('.task-item-edit span').forEach(span => {
                    const taskText = span.textContent.trim();
                    if (taskText) {
                        tasks.push(taskText);
                    }
                });
                dailyTasks[day] = tasks;
            }
        });
        
        // Update in Supabase
        const { error } = await supabaseClient
            .from('habits')
            .update({
                name: taskName,
                daily_tasks: dailyTasks
            })
            .eq('id', this.editingTaskId);
            
        if (error) {
            console.error('Error updating task:', error);
            alert('Error updating task: ' + error.message);
            return;
        }
        
        this.renderTasks();
        this.renderTodayTasks();
        document.getElementById('edit-modal').style.display = 'none';
        this.editingTaskId = null;
    }

    async deleteTask() {
        if (!this.editingTaskId) return;
        await supabaseClient
            .from('habits')
            .delete()
            .eq('id', this.editingTaskId);
        this.renderTasks();
        document.getElementById('edit-modal').style.display = 'none';
        this.editingTaskId = null;
    }

    // saveHabits() { // Removed as per instructions
    //     localStorage.setItem('habits', JSON.stringify(this.habits)); // Removed as per instructions
    // } // Removed as per instructions

    async testSupabaseConnection() {
        console.log('Testing Supabase connection...');
        console.log('URL:', SUPABASE_URL);
        console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
        
        try {
            const { data, error } = await supabaseClient
                .from('habits')
                .select('count')
                .limit(1);
                
            if (error) {
                console.error('Supabase connection test failed:', error);
                alert('Supabase connection failed: ' + error.message);
            } else {
                console.log('Supabase connection successful!');
            }
        } catch (err) {
            console.error('Network error:', err);
            alert('Network error connecting to Supabase: ' + err.message);
        }
    }
}

// Initialize the task tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TaskTracker();
});

// Add some sample data for demonstration (optional)
// function addSampleHabits() { // Removed as per instructions
//     const sampleHabits = [ // Removed as per instructions
//         { // Removed as per instructions
//             id: '1', // Removed as per instructions
//             name: 'Exercise', // Removed as per instructions
//             color: '#FF8A9A', // Removed as per instructions
//             completedDates: [], // Removed as per instructions
//             createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Removed as per instructions
//         }, // Removed as per instructions
//         { // Removed as per instructions
//             id: '2', // Removed as per instructions
//             name: 'Read', // Removed as per instructions
//             color: '#8AFF9A', // Removed as per instructions
//             completedDates: [], // Removed as per instructions
//             createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // Removed as per instructions
//         } // Removed as per instructions
//     ]; // Removed as per instructions

//     // Add some sample completion data for the past few months // Removed as per instructions
//     const today = new Date(); // Removed as per instructions
//     for (let i = 0; i < 90; i++) { // Removed as per instructions
//         const date = new Date(today); // Removed as per instructions
//         date.setDate(date.getDate() - i); // Removed as per instructions
//         const dateString = date.toISOString().split('T')[0]; // Removed as per instructions
        
//         // Randomly mark some habits as completed // Removed as per instructions
//         sampleHabits.forEach(habit => { // Removed as per instructions
//             if (Math.random() > 0.4) { // Removed as per instructions
//                 habit.completedDates.push(dateString); // Removed as per instructions
//             } // Removed as per instructions
//         }); // Removed as per instructions
//     } // Removed as per instructions

//     localStorage.setItem('habits', JSON.stringify(sampleHabits)); // Removed as per instructions
// } // Removed as per instructions

// Function to clear all data // Removed as per instructions
// function clearAllData() { // Removed as per instructions
//     localStorage.removeItem('habits'); // Removed as per instructions
//     location.reload(); // Removed as per instructions
// } // Removed as per instructions

// Uncomment the line below to add sample data for demonstration // Removed as per instructions
// addSampleHabits(); 