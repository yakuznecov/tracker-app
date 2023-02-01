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
	},
	popup: {
		index: document.getElementById('add_popup'),
		iconField: document.querySelector('.popup__form input[name="icon"]'),
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

function togglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
}

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};
	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');

		if (!fieldValue) {
			form[field].classList.add('error');
		}
		res[field] = fieldValue;
	}

	let isValid = true;

	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}

	if (!isValid) {
		return;
	}

	return res;
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

	document.location.replace(document.location.pathname + '#' + activeHabitId);

	rerenderMenu(activeHabit);
	rerenderHead(activeHabit);
	rerenderContent(activeHabit);
}

// work with days
function addDays(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ['comment']);

	if (!data) {
		return;
	}

	habits = habits.map(habit => {
		if (habit.id === globalActiveHabitId) {
			return {
				...habit,
				days: habit.days.concat([{ comment: data.comment }])
			}
		}
		return habit;
	});

	resetForm(event.target, ['comment']);
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

// work with habit

function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

function addHabit(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}

	const maxId = habits.reduce((acc, habit) => acc > habit.id ? acc : habit.id, 0);

	habits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});

	resetForm(event.target, ['name', 'target']);
	togglePopup();
	saveData();
	rerender(maxId + 1);
}

// init
(() => {
	loadData();
	rerender(habits[0].id);
})(); 