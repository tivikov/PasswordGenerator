class PasswordGenerator {
	
	static PARAMETER_UPPER_CASE = 'UPPERCASE';
	static PARAMETER_LOWER_CASE = 'LOWERCASE';
	static PARAMETER_NUMBERS = 'NUMBERS';
	static PARAMETER_SYMBOLS = 'SYMBOLS';
	
	#length;
	#options = {};
	#parameters = {};
	
	#passwordStrongLevel = 0;
	
	constructor() {
		this.setLength()
			.setParameter(PasswordGenerator.PARAMETER_UPPER_CASE, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
			.setParameter(PasswordGenerator.PARAMETER_LOWER_CASE, 'abcdefghijklmnopqrstuvwxyz')
			.setParameter(PasswordGenerator.PARAMETER_NUMBERS, '0123456789')
			.setParameter(PasswordGenerator.PARAMETER_SYMBOLS, '!@$%^&*()<>,.?/[]{}-=_+')
	}
	
	setLength(value = 16) {
		this.#length = value;
		this.#calculatePasswordStrongLevel()
		return this;
	}
	
	#getLength() {
		return this.#length
	}
	
	setParameter(option, value) {
		this.#parameters[option] = value;
		return this;
	}
	
	getParameter(option, def = null) {
		if (!this.#parameters[option]) {
			return def;
		}
		return this.#parameters[option]
	}
	
	#calculatePasswordStrongLevel() {
		const length = this.#getLength();
		const optionsCount = this.#getOptionsCount();
		const koefOption = 1;
		const strongLevelLength = Math.floor(length / 5);
		const strongLevelOption = optionsCount * koefOption;
		this.#passwordStrongLevel = strongLevelLength + strongLevelOption;
	}
	
	setOption(option, value) {
		this.#options[option] = value;
		this.#calculatePasswordStrongLevel();
		return this;
	}
	
	getOption(option) {
		if (!this.#options[option]) {
			return null;
		}
		return this.#options[option]
	}
	
	#getOptionsCount() {
		return Object.keys(this.#options).length
	}
	
	getCharacterList() {
		let characters = '';
		
		if (this.getOption(PasswordGenerator.PARAMETER_UPPER_CASE)) {
			characters += this.getParameter(PasswordGenerator.PARAMETER_UPPER_CASE);
		}
		
		if (this.getOption(PasswordGenerator.PARAMETER_LOWER_CASE)) {
			characters += this.getParameter(PasswordGenerator.PARAMETER_LOWER_CASE);
		}
		
		if (this.getOption(PasswordGenerator.PARAMETER_NUMBERS)) {
			characters += this.getParameter(PasswordGenerator.PARAMETER_NUMBERS);
		}
		
		if (this.getOption(PasswordGenerator.PARAMETER_SYMBOLS)) {
			characters+= this.getParameter(PasswordGenerator.PARAMETER_SYMBOLS);
		}
		
		return characters;
	}
	
	generatePassword() {
		const charactersList = this.getCharacterList();
		const characters = charactersList.length;
		if (!charactersList) return '';
		
		const length = this.#getLength();
		
		let password = '';
		
		for (let i = 0; i < length; ++i) {
			const randNum = Math.floor(Math.random() * characters);
			password += charactersList[randNum];
		}
		
		return password;
	}
	
	getPasswordStrongLevel() {
		return this.#passwordStrongLevel;
	}
}

const form = document.querySelector('[data-form="zoog-pass-g-form"]');

const checkboxes = form.querySelectorAll('[data-zoog-input]');
const fieldToPut = form.querySelector('[data-zoog-pass-value]');
const clickToCopy = form.querySelector('[data-zoog-pass-value-copy]');
const strongLevel = form.querySelector('[data-zoog-pass-strong-level]');
const range = form.querySelector('[data-zoog-range]');
const rangeValue = form.querySelector('[data-zoog-password-length-value]')

const stepButtons = form.querySelectorAll('[data-zoog-range-direction]');

[...checkboxes].map(checkbox => {
	checkbox.addEventListener('change', emitChange);
})

range.addEventListener('input', () => {
	rangeValue.innerText = range.value;
	emitChange()
});

clickToCopy.addEventListener('click', (e) => {
	navigator.clipboard.writeText(fieldToPut.value).then(() => {});
});

[...stepButtons].map(stepButton => {
	stepButton.addEventListener('click', (e) => {
		const direction = e.target.getAttribute('data-zoog-range-direction');
		
		changeRange(range, direction)
	})
});

emitChange();
form.addEventListener('submit', (e) => {
	e.preventDefault();
	emitChange();
})

function emitChange() {
	const formData = new FormData(form);
	
	let generator = new PasswordGenerator();
	for (let [key, value] of formData.entries()) {
		if (key === 'LENGTH') {
			generator.setLength(+value)
		} else if (key === 'UPPERCASE') {
			generator.setOption(PasswordGenerator.PARAMETER_UPPER_CASE, true);
		} else if (key === 'LOWERCASE') {
			generator.setOption(PasswordGenerator.PARAMETER_LOWER_CASE, true);
		} else if (key === 'NUMBERS') {
			generator.setOption(PasswordGenerator.PARAMETER_NUMBERS, true);
		} else if (key === 'SYMBOLS') {
			generator.setOption(PasswordGenerator.PARAMETER_SYMBOLS, true);
		}
	}
	
	fieldToPut.value = generator.generatePassword();
	const strongLevelValue = generator.getPasswordStrongLevel();
	if (strongLevelValue < 5) {
		strongLevel.innerText = 'Low'
	} else if (strongLevelValue < 7) {
		strongLevel.innerText = 'Medium'
	} else if (strongLevelValue < 9) {
		strongLevel.innerText = 'Strong'
	} else {
		strongLevel.innerText = 'Super Strong';
	}
	
	generator = null;
}

function changeRange(slider, direction) {
	const min = slider.getAttribute('min')
	const max = slider.getAttribute('max')
	let step = parseInt(slider.getAttribute('step'), 10);
	let currentSliderValue = +slider.value;
	if (slider.value === min && direction === 'left') {
		return;
	}
	if (slider.value === max && direction === 'right') {
		return;
	}
	
	let newStepValue;
	
	if (direction === "left") {
		newStepValue = currentSliderValue - step;
	} else {
		newStepValue = currentSliderValue + step;
	}
	
	if (currentSliderValue !== newStepValue) {
		range.value = newStepValue;
		rangeValue.innerText = range.value;
		emitChange();
	}
}
