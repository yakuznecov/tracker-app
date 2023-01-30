'use strict';

let habits = [];
const HABIT_KEY = 'HABIT_KEY';
let globalActiveHabitId;

// page
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress_percent'),
		progressBarCover: document.querySelector('.progress__bar_cover'),
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.day'),
	}
};

// Utils

function loadData() {
	const habitsString = localStorage.getItem(HABIT_KEY);
	const habitsArray = JSON.parse(habitsString);
	// проверка, что действительно массив
	if (Array.isArray(habitsArray)) {
		habits = habitsArray;
	}
}

function saveData() {
	localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

// render

function rerenderMenu(activeHabit) {
	document.querySelector('.menu__list').innerHTML = '';

	for (const habit of habits) {
		const existed = document.querySelector(`[menu-habit-id='${habit.id}']`);

		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habit-id', habit.id);
			element.classList.add('menu__list_item');
			element.addEventListener('click', () => rerender(habit.id));
			element.innerHTML = `<img src="images/${habit.icon}.svg" alt="${habit.name}">`;

			if (habit.id === activeHabit.id) {
				element.classList.add('menu__list_item_active');
			}

			page.menu.appendChild(element);
			continue;
		}

		if (habit.id === activeHabit.id) {
			existed.classList.add('menu__list_item_active');
		} else {
			existed.classList.remove('menu__list_item_active');
		}
	}
}

function rerenderHead(activeHabit) {
	page.header.h1.innerHTML = activeHabit.name;
	const progress = activeHabit.days.length / activeHabit.target > 1
		? 100
		: activeHabit.days.length / activeHabit.target * 100;
	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressBarCover.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabit) {
	page.content.daysContainer.innerHTML = '';

	for (const index in activeHabit.days) {
		const element = document.createElement('div');
		element.classList.add('habit');
		element.innerHTML = `<div class="day">День ${Number(index) + 1}</div>
		<div class="comment">${activeHabit.days[index].comment}</div>
		<button class="delete" onclick='deleteDay(${index})'>
			<img src="images/delete.svg" alt="delete">
		</button>`;
		page.content.daysContainer.appendChild(element);
	}

	page.content.nextDay.innerHTML = `День ${activeHabit.days.length + 1}`;
}

function rerender(activeHabitId) {
	globalActiveHabitId = activeHabitId;
	const activeHabit = habits.find(habit => habit.id === activeHabitId);
	if (!activeHabit) {
		return;
	}

	rerenderMenu(activeHabit);
	rerenderHead(activeHabit);
	rerenderContent(activeHabit);
}

// work with days
function addDays(event) {
	event.preventDefault();
	const form = event.target;

	const data = new FormData(event.target);
	const comment = data.get('comment');
	form['comment'].classList.remove('error');
	if (!comment) {
		form['comment'].classList.add('error');
	}

	habits = habits.map(habit => {
		if (habit.id === globalActiveHabitId) {
			return {
				...habit,
				days: habit.days.concat([{ comment }])
			}
		}
		return habit;
	});

	form['comment'].value = '';
	rerender(globalActiveHabitId);
	saveData();
}

function deleteDay(index) {
	habits = habits.map(habit => {
		if (habit.id === globalActiveHabitId) {
			habit.days.splice(index, 1);
			return {
				...habit,
				days: habit.days
			};
		}
		return habit;
	});

	rerender(globalActiveHabitId);
	saveData();
}

// init
(() => {
	loadData();
	rerender(habits[0].id);
})(); 