const SUPABASE_URL = 'https://ahlqtbmmvefgwjhbrcpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF0Ym1tdmVmZ3dqaGJyY3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NDEwNjMsImV4cCI6MjA2ODAxNzA2M30.ebIpSg8WsdWTf-JDhTCkRRVYKfjOYryxKt9iGm0XsNw';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Habit Tracker JavaScript - Minimalist Version

class HabitTracker {
    constructor() {
        // Clear localStorage to ensure new colors are applied
        // localStorage.removeItem('habits'); // Removed as per instructions
        
        // this.habits = JSON.parse(localStorage.getItem('habits')) || []; // Removed as per instructions
        this.editingHabitId = null;
        
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
        this.updateExistingHabitColors(); // Update colors for existing habits
        this.renderHabits();
    }

    initializeEventListeners() {
        // Form submission for adding new habits
        const habitForm = document.getElementById('habit-form');
        habitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addHabit();
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
            this.saveHabitEdit();
        });

        // Delete habit button
        document.getElementById('delete-habit').addEventListener('click', () => {
            this.deleteHabit();
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

    async addHabit() {
        const nameInput = document.getElementById('habit-name');
        const habitName = nameInput.value.trim();
        
        if (!habitName) return;
        
        const randomColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
        const habit = {
            name: habitName,
            color: randomColor,
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
        
        console.log('Attempting to insert habit:', habit);
        console.log('Using color:', randomColor);
        
        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('habits')
            .insert([habit]);
            
        if (error) {
            console.error('Supabase error:', error);
            alert('Error adding habit: ' + JSON.stringify(error, null, 2));
            return;
        }
        
        console.log('Successfully inserted habit:', data);
        this.renderHabits();
        this.renderTodayTasks();
        nameInput.value = '';
        this.showNotification('Habit added successfully!', 'success');
    }

    async updateExistingHabitColors() {
        console.log('Updating existing habit colors...');
        
        const { data: habits, error } = await supabaseClient
            .from('habits')
            .select('*');
            
        if (error) {
            console.error('Error fetching habits for color update:', error);
            return;
        }
        
        for (const habit of habits) {
            // Check if habit has old color palette
            const oldColors = ['#e78ab6', '#f4a6c1', '#fbc6e2', '#f7d1ea', '#ffc3b1', '#ffd6c3', '#ffe3d3', '#b6a6f8', '#a6a1f7', '#8883e6'];
            if (oldColors.includes(habit.color)) {
                const newColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
                console.log(`Updating habit "${habit.name}" from ${habit.color} to ${newColor}`);
                
                await supabaseClient
                    .from('habits')
                    .update({ color: newColor })
                    .eq('id', habit.id);
            }
        }
        
        console.log('Color update complete');
        this.renderHabits();
        this.renderTodayTasks();
    }

    renderTodayTasks() {
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        console.log('Today is:', dayOfWeek);
        
        // Get all habits and filter for today's tasks
        supabaseClient
            .from('habits')
            .select('*')
            .then(({ data: habits, error }) => {
                if (error) {
                    console.error('Error fetching habits for today:', error);
                    return;
                }
                
                console.log('All habits:', habits);
                
                // Show all habits in Today's Tasks, regardless of whether they have specific daily tasks
                const todayTasks = habits;
                console.log(`Showing ${todayTasks.length} habits in Today's Tasks`);
                
                console.log('Habits with tasks for today:', todayTasks);
                
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
                todayTasks.forEach(habit => {
                    const dailyTasks = habit.daily_tasks || {};
                    const todayTasks = dailyTasks[dayOfWeek] || [];
                    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
                    const isCompleted = habit.completed_dates && habit.completed_dates.includes(today);
                    
                    console.log(`Habit "${habit.name}" using color: ${habit.color}`);
                    
                    todayHTML += `
                        <div class="today-task ${isCompleted ? 'completed' : ''}" style="--habit-color: ${habit.color}" data-habit-id="${habit.id}" data-date="${today}">
                            <div class="task-header">
                                <div class="task-name">${habit.name}</div>
                                <div class="task-status">
                                    ${isCompleted ? '<span class="completion-checkmark">✓</span>' : ''}
                                    <label class="task-checkbox">
                                        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-habit-id="${habit.id}" data-date="${today}">
                                    </label>
                                </div>
                            </div>
                            <div class="task-list">
                                ${todayTasks.length > 0 
                                    ? todayTasks.map(task => `<div class="task-item">• ${task}</div>`).join('')
                                    : '<div class="task-item">Complete this habit today</div>'
                                }
                            </div>
                        </div>
                    `;
                });
                
                todayContainer.innerHTML = todayHTML;
                
                // Add event listeners to checkboxes
                const checkboxes = todayContainer.querySelectorAll('input[type="checkbox"]');
                console.log(`Found ${checkboxes.length} checkboxes to add listeners to`);
                
                checkboxes.forEach(checkbox => {
                    console.log('Adding listener to checkbox:', checkbox.dataset.habitId);
                    checkbox.addEventListener('change', (e) => {
                        console.log('Checkbox clicked!', e.target.checked);
                        const habitId = e.target.dataset.habitId;
                        const date = e.target.dataset.date;
                        const isChecked = e.target.checked;
                        
                        console.log('Habit ID:', habitId, 'Date:', date, 'Checked:', isChecked);
                        
                        this.toggleHabitCompletion(habitId, date);
                        
                        // Update the visual state of the calendar cell
                        const habitCards = document.querySelectorAll('.habit-card');
                        for (const card of habitCards) {
                            const editBtn = card.querySelector('.edit-btn');
                            if (editBtn && editBtn.dataset.habitId === habitId) {
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
                        
                        const habitId = taskItem.dataset.habitId;
                        const date = taskItem.dataset.date;
                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        const isCurrentlyChecked = checkbox.checked;
                        
                        console.log('Task item clicked!', habitId, date, 'Currently checked:', isCurrentlyChecked);
                        
                        // Toggle the checkbox
                        checkbox.checked = !isCurrentlyChecked;
                        
                        // Trigger the change event
                        checkbox.dispatchEvent(new Event('change'));
                    });
                });
            });
    }

    async renderHabits() {
        const container = document.getElementById('habits-container');
        container.innerHTML = '';
        
        console.log('Attempting to fetch habits from Supabase...');
        
        const { data: habits, error } = await supabaseClient
            .from('habits')
            .select('*');
            
        if (error) {
            console.error('Error fetching habits:', error);
            container.innerHTML = '<div class="empty-state"><p>Error loading habits: ' + error.message + '</p></div>';
            return;
        }
        
        console.log('Successfully fetched habits:', habits);
        if (!habits.length) {
            container.innerHTML = '<div class="empty-state"><p>No habits yet. Add your first habit to get started!</p></div>';
            return;
        }
        
        // Sort habits by creation date (oldest first)
        habits.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        habits.forEach(habit => {
            const habitCard = this.createHabitCard(habit);
            container.appendChild(habitCard);
        });
        
        // Also render today's tasks
        this.renderTodayTasks();
    }

    createHabitCard(habit) {
        const card = document.createElement('div');
        card.className = 'habit-card';

        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-name">${habit.name}</div>
                <button class="action-btn edit-btn" data-habit-id="${habit.id}" title="Edit">
                    Edit
                </button>
            </div>
            <div class="monthly-calendars" style="--habit-color: ${habit.color}">
                ${this.generateMonthlyCalendars(habit)}
            </div>
        `;

        // Add event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => {
            this.openEditModal(habit);
        });

        // Add click listeners to day cells
        const dayCells = card.querySelectorAll('.day-cell:not(.future):not(.other-month)');
        dayCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const dateString = cell.dataset.date;
                this.toggleHabitCompletion(habit.id, dateString);
            });
        });

        return card;
    }

    generateMonthlyCalendars(habit) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let calendars = '';
        
        // Generate calendars for the preceding 3 months plus current week
        for (let i = 3; i >= 0; i--) {
            const targetMonth = currentMonth - i;
            const targetYear = currentYear;
            
            // Handle year rollover
            let month = targetMonth;
            let year = targetYear;
            if (targetMonth < 0) {
                month = 12 + targetMonth;
                year = targetYear - 1;
            }
            
            calendars += this.generateMonthCalendar(habit, year, month, today);
        }
        
        return calendars;
    }

    generateMonthCalendar(habit, year, month, today) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        
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
            const dateString = currentDate.toISOString().split('T')[0];
            const isCompleted = habit.completed_dates.includes(dateString);
            const isToday = dateString === today.toISOString().split('T')[0];
            const isFuture = currentDate > today;
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

    async toggleHabitCompletion(habitId, dateString) {
        // Fetch the habit
        const { data: habits } = await supabaseClient
            .from('habits')
            .select('*')
            .eq('id', habitId);
        const habit = habits[0];
        if (!habit) return;

        let completed_dates = habit.completed_dates || [];
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
            .eq('id', habitId);

        // Update only the visual state of the clicked date
        // Find the habit card that contains the clicked cell
        const habitCards = document.querySelectorAll('.habit-card');
        let clickedCell = null;
        
        for (const card of habitCards) {
            const editBtn = card.querySelector('.edit-btn');
            if (editBtn && editBtn.dataset.habitId === habitId) {
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
            const todayCheckbox = document.querySelector(`input[data-habit-id="${habitId}"][data-date="${today}"]`);
            if (todayCheckbox) {
                todayCheckbox.checked = !isCompleted;
            }
        }
    }

    openEditModal(habit) {
        this.editingHabitId = habit.id;
        
        document.getElementById('edit-habit-name').value = habit.name;
        
        // Populate daily tasks
        const dailyTasks = habit.daily_tasks || {};
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

    async saveHabitEdit() {
        if (!this.editingHabitId) return;
        
        const habitName = document.getElementById('edit-habit-name').value.trim();
        if (!habitName) return;
        
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
                name: habitName,
                daily_tasks: dailyTasks
            })
            .eq('id', this.editingHabitId);
            
        if (error) {
            console.error('Error updating habit:', error);
            alert('Error updating habit: ' + error.message);
            return;
        }
        
        this.renderHabits();
        this.renderTodayTasks();
        document.getElementById('edit-modal').style.display = 'none';
        this.editingHabitId = null;
        this.showNotification('Habit updated successfully!', 'success');
    }

    async deleteHabit() {
        if (!this.editingHabitId) return;
        await supabaseClient
            .from('habits')
            .delete()
            .eq('id', this.editingHabitId);
        this.renderHabits();
        document.getElementById('edit-modal').style.display = 'none';
        this.editingHabitId = null;
        this.showNotification('Habit deleted successfully!', 'success');
    }

    // saveHabits() { // Removed as per instructions
    //     localStorage.setItem('habits', JSON.stringify(this.habits)); // Removed as per instructions
    // } // Removed as per instructions

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ECDC4' : type === 'error' ? '#FF6B6B' : '#45B7D1'};
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 0.875rem;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

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

// Initialize the habit tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
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