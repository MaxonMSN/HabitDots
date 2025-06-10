
// Habit Status: 'pending', 'done', 'missed'
type HabitDayStatus = 'pending' | 'done' | 'missed';

interface HabitDay {
    status: HabitDayStatus;
}

interface Habit {
    id: number; // Unique ID, timestamp based
    name: string;
    days: HabitDay[]; // Array of 7 days
    createdAt: number;
}

const MAX_DAYS = 7; // Track for 7 days (weekly)
const HABITS_STORAGE_KEY = 'habitDotsData';

let habits: Habit[] = [];

const newHabitInput = document.getElementById('new-habit-input') as HTMLInputElement;
const addHabitButton = document.getElementById('add-habit-button') as HTMLButtonElement;
const habitsListContainer = document.getElementById('habits-list-container') as HTMLDivElement;
const resetWeekButton = document.getElementById('reset-week-button') as HTMLButtonElement;

function saveHabits() {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

function loadHabits() {
    const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
        // Ensure all habits have the correct number of days, adapting old data if necessary
        habits.forEach(habit => {
            if (!habit.days || habit.days.length !== MAX_DAYS) {
                habit.days = Array(MAX_DAYS).fill(null).map(() => ({ status: 'pending' }));
            }
        });
    }
}

function renderHabits() {
    if (!habitsListContainer) return;
    habitsListContainer.innerHTML = ''; // Clear existing habits

    if (habits.length === 0) {
        habitsListContainer.innerHTML = `<p class="empty-state">No habits yet. Add one to get started!</p>`;
        return;
    }

    habits.sort((a, b) => a.createdAt - b.createdAt); // Show oldest first

    habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.setAttribute('role', 'listitem');
        habitItem.setAttribute('aria-label', `${habit.name} habit`);

        const habitNameEl = document.createElement('span');
        habitNameEl.className = 'habit-name';
        habitNameEl.textContent = habit.name;

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'habit-dots';
        dotsContainer.setAttribute('role', 'group');
        dotsContainer.setAttribute('aria-label', `${habit.name} daily status`);


        habit.days.forEach((day, dayIndex) => {
            const dot = document.createElement('button'); // Use button for accessibility
            dot.className = `dot ${day.status}`;
            dot.setAttribute('aria-label', `Day ${dayIndex + 1}, status: ${day.status}. Click to change.`);
            dot.setAttribute('data-habit-id', habit.id.toString());
            dot.setAttribute('data-day-index', dayIndex.toString());
            dot.addEventListener('click', () => toggleDayStatus(habit.id, dayIndex));
            dotsContainer.appendChild(dot);
        });

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-habit-button';
        removeButton.textContent = 'Remove';
        removeButton.setAttribute('aria-label', `Remove habit: ${habit.name}`);
        removeButton.addEventListener('click', () => removeHabit(habit.id));

        habitItem.appendChild(habitNameEl);
        habitItem.appendChild(dotsContainer);
        habitItem.appendChild(removeButton);
        habitsListContainer.appendChild(habitItem);
    });
}

function addHabit() {
    if (!newHabitInput) return;
    const habitName = newHabitInput.value.trim();
    if (habitName === '') {
        alert('Please enter a habit name.');
        newHabitInput.focus();
        return;
    }

    const newHabit: Habit = {
        id: Date.now(),
        name: habitName,
        days: Array(MAX_DAYS).fill(null).map(() => ({ status: 'pending' })),
        createdAt: Date.now(),
    };

    habits.push(newHabit);
    newHabitInput.value = ''; // Clear input
    saveHabits();
    renderHabits();
    newHabitInput.focus();
}

function removeHabit(habitId: number) {
    habits = habits.filter(habit => habit.id !== habitId);
    saveHabits();
    renderHabits();
}

function toggleDayStatus(habitId: number, dayIndex: number) {
    const habit = habits.find(h => h.id === habitId);
    if (habit && habit.days[dayIndex]) {
        const currentStatus = habit.days[dayIndex].status;
        if (currentStatus === 'pending') {
            habit.days[dayIndex].status = 'done';
        } else if (currentStatus === 'done') {
            habit.days[dayIndex].status = 'missed';
        } else { // missed
            habit.days[dayIndex].status = 'pending';
        }
        saveHabits();
        renderHabits(); // Re-render to update dot color and ARIA label
    }
}

function resetWeek() {
    if (habits.length === 0) {
        alert("No habits to reset. Add some habits first!");
        return;
    }
    const confirmed = confirm("Are you sure you want to start a new week? This will reset all habit progress.");
    if (confirmed) {
        habits.forEach(habit => {
            habit.days = Array(MAX_DAYS).fill(null).map(() => ({ status: 'pending' }));
        });
        saveHabits();
        renderHabits();
    }
}


// Event Listeners
if (addHabitButton && newHabitInput) {
    addHabitButton.addEventListener('click', addHabit);
    newHabitInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addHabit();
        }
    });
}

if (resetWeekButton) {
    resetWeekButton.addEventListener('click', resetWeek);
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    renderHabits();
    if (newHabitInput) {
      newHabitInput.focus();
    }
});
