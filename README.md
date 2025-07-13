# Habit Tracker

A beautiful, modern habit tracking web application built with HTML, CSS, and JavaScript. Track your daily habits, view your progress on a calendar, and monitor your statistics to build better habits.

## Features

### 🎯 Core Functionality
- **Add New Habits**: Create habits with custom names, descriptions, and colors
- **Mark Completion**: Easily mark habits as complete/incomplete for each day
- **Progress Tracking**: Visual progress bars show your completion rate
- **Calendar View**: See your habit completion history on a monthly calendar
- **Statistics Dashboard**: Track your current streak, total completions, and completion rate

### 🎨 Modern Design
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient backgrounds, smooth animations, and clean typography
- **Color Coding**: Each habit can be assigned a custom color for easy identification
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive controls

### 💾 Data Persistence
- **Local Storage**: Your habits and progress are saved locally in your browser
- **No Account Required**: Start tracking immediately without any setup
- **Privacy First**: All data stays on your device

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. The habit tracker will load with an empty state
3. Start by adding your first habit using the "Add New Habit" form

### Adding Habits
1. Fill in the habit name (required)
2. Add an optional description
3. Choose a color for your habit
4. Click "Add Habit" to create it

### Tracking Progress
- **Mark Complete**: Click the circle icon next to a habit to mark it as complete for today
- **Mark Incomplete**: Click the checkmark icon to unmark a completed habit
- **Edit Habit**: Click the edit icon to modify habit details
- **Delete Habit**: Use the edit modal to delete habits you no longer want to track

### Calendar View
- **Navigate Months**: Use the arrow buttons to move between months
- **View Progress**: Completed days are highlighted in green
- **Today's Date**: The current date is highlighted in blue
- **Click Days**: Click on calendar days to see information about that day's completion status

### Statistics
- **Current Streak**: Shows how many consecutive days you've completed at least one habit
- **Total Completed**: Total number of days with completed habits
- **Completion Rate**: Percentage of days with completed habits since you started tracking

## File Structure

```
habit-tracker/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Browser Compatibility

This habit tracker works in all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Adding Sample Data
To see the habit tracker in action with sample data, uncomment the last line in `script.js`:

```javascript
// Uncomment this line to add sample habits
addSampleHabits();
```

### Styling Customization
You can customize the appearance by modifying `styles.css`:
- Change the gradient background in the `body` selector
- Modify color schemes in the button and card styles
- Adjust spacing and typography throughout

### Feature Extensions
The modular JavaScript code makes it easy to add new features:
- Add habit categories or tags
- Implement habit streaks for individual habits
- Add reminder notifications
- Export/import habit data

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Object-oriented programming with classes
- **Local Storage API**: Data persistence
- **Font Awesome**: Icons
- **Google Fonts**: Typography

### Key JavaScript Features
- **Class-based Architecture**: Organized, maintainable code
- **Event-driven**: Responsive user interactions
- **Data Management**: Efficient habit and progress tracking
- **DOM Manipulation**: Dynamic content updates
- **Date Handling**: Accurate calendar and streak calculations

## Tips for Success

1. **Start Small**: Begin with 2-3 habits to build momentum
2. **Be Specific**: Instead of "exercise," try "30 minutes of walking"
3. **Check Daily**: Make habit tracking part of your daily routine
4. **Celebrate Progress**: Use the statistics to see your improvement over time
5. **Adjust as Needed**: Edit or delete habits that aren't working for you

## Future Enhancements

Potential features that could be added:
- Habit categories and filtering
- Weekly/monthly goal setting
- Habit streaks and milestones
- Data export/import functionality
- Push notifications and reminders
- Dark mode theme
- Habit templates and suggestions

## Support

If you encounter any issues or have questions about the habit tracker, the code is well-commented and organized for easy understanding and modification.

Happy habit building! 🚀 