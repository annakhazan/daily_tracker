// Habit Tracker JavaScript - Minimalist Version

class HabitTracker {
    constructor() {
        // Clear localStorage to ensure new colors are applied
        localStorage.removeItem('habits');
        
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.editingHabitId = null;
        
        // 10-color harmonious pastel palette
        this.colorPalette = [
            '#e78ab6', // pink
            '#f4a6c1', // rose
            '#fbc6e2', // light pink
            '#f7d1ea', // blush
            '#ffc3b1', // peach
            '#ffd6c3', // apricot
            '#ffe3d3', // pale peach
            '#b6a6f8', // lavender
            '#a6a1f7', // periwinkle
            '#8883e6'  // soft violet
        ];
        
        this.initializeEventListeners();
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
    }

    addHabit() {
        const nameInput = document.getElementById('habit-name');

        // Get a random color from the palette
        const randomColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];

        const habit = {
            id: Date.now().toString(),
            name: nameInput.value.trim(),
            color: randomColor,
            completedDates: [],
            createdAt: new Date().toISOString()
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();

        // Reset form
        nameInput.value = '';

        // Show success message
        this.showNotification('Habit added successfully!', 'success');
    }

    renderHabits() {
        const container = document.getElementById('habits-container');
        container.innerHTML = '';

        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No habits yet. Add your first habit to get started!</p>
                </div>
            `;
            return;
        }

        this.habits.forEach(habit => {
            const habitCard = this.createHabitCard(habit);
            container.appendChild(habitCard);
        });
    }

    createHabitCard(habit) {
        const card = document.createElement('div');
        card.className = 'habit-card';

        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-actions">
                    <button class="action-btn edit-btn" data-habit-id="${habit.id}" title="Edit">
                        Edit
                    </button>
                </div>
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
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateString = currentDate.toISOString().split('T')[0];
            const isCompleted = habit.completedDates.includes(dateString);
            const isToday = dateString === today.toISOString().split('T')[0];
            const isFuture = currentDate > today;
            const isOtherMonth = currentDate.getMonth() !== month;
            
            let classes = 'day-cell';
            if (isCompleted) classes += ' completed';
            if (isToday) classes += ' today';
            if (isFuture) classes += ' future';
            if (isOtherMonth) classes += ' other-month';
            
            calendar += `<div class="${classes}" data-date="${dateString}">${currentDate.getDate()}</div>`;
        }
        
        calendar += `
                </div>
            </div>
        `;
        
        return calendar;
    }

    toggleHabitCompletion(habitId, dateString) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const isCompleted = habit.completedDates.includes(dateString);

        if (isCompleted) {
            habit.completedDates = habit.completedDates.filter(date => date !== dateString);
        } else {
            habit.completedDates.push(dateString);
        }

        this.saveHabits();
        this.renderHabits();

        const message = isCompleted ? 'Habit marked as incomplete' : 'Habit completed!';
        this.showNotification(message, isCompleted ? 'info' : 'success');
    }

    openEditModal(habit) {
        this.editingHabitId = habit.id;
        
        document.getElementById('edit-habit-name').value = habit.name;
        
        document.getElementById('edit-modal').style.display = 'block';
    }

    saveHabitEdit() {
        const habit = this.habits.find(h => h.id === this.editingHabitId);
        if (!habit) return;

        habit.name = document.getElementById('edit-habit-name').value.trim();

        this.saveHabits();
        this.renderHabits();

        document.getElementById('edit-modal').style.display = 'none';
        this.editingHabitId = null;

        this.showNotification('Habit updated successfully!', 'success');
    }

    deleteHabit() {
        if (!this.editingHabitId) return;

        if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
            this.habits = this.habits.filter(h => h.id !== this.editingHabitId);
            this.saveHabits();
            this.renderHabits();

            document.getElementById('edit-modal').style.display = 'none';
            this.editingHabitId = null;

            this.showNotification('Habit deleted successfully!', 'success');
        }
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

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
}

// Initialize the habit tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});

// Add some sample data for demonstration (optional)
function addSampleHabits() {
    const sampleHabits = [
        {
            id: '1',
            name: 'Exercise',
            color: '#FF8A9A', // Coral Pink
            completedDates: [],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: '2',
            name: 'Read',
            color: '#8AFF9A', // Mint Green
            completedDates: [],
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Add some sample completion data for the past few months
    const today = new Date();
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Randomly mark some habits as completed
        sampleHabits.forEach(habit => {
            if (Math.random() > 0.4) { // 60% chance of completion
                habit.completedDates.push(dateString);
            }
        });
    }

    localStorage.setItem('habits', JSON.stringify(sampleHabits));
}

// Function to clear all data
function clearAllData() {
    localStorage.removeItem('habits');
    location.reload();
}

// Uncomment the line below to add sample data for demonstration
// addSampleHabits(); 