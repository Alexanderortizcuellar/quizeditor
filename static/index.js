let spinner = document.querySelector("div.spin");
let screenLoad = document.querySelector("div.loading-screen");
let button = document.querySelector("button#fetch");
let buttonUpdate = document.querySelector("button#update");
let alertDiv = document.querySelector("div.alert");
let textInput = document.querySelector("textarea#text");
let answerInput = document.querySelector("select#answer");
let optionsInput = document.querySelector("input#options");
let quoteInput = document.querySelector("input#quote");
let rowInput = document.querySelector("input#row");
let modalW = document.querySelector("#exampleModal");
let modalBody = document.querySelector("div.modal-picker-body");
let modalTitle = document.querySelector("h5.modal-picker-title");
let shuffleBtn = document.querySelector("button.shuffle-btn");
let picker = document.querySelector("button.picker");
const toastAlert = document.getElementById('liveToast');
let toastMsg = document.querySelector("div#liveToast div.message")
const toast = bootstrap.Toast.getOrCreateInstance(toastAlert);
let modal = new bootstrap.Modal(modalW, {})
button.addEventListener("click", () => {
	getRow();
});
buttonUpdate.addEventListener("click", () => {
	updateRow();
});

picker.addEventListener("click", () => {
	getBibleText(quoteInput.value);
})

shuffleBtn.addEventListener("click", () => {
	shuffle();
})

optionsInput.addEventListener("keyup", () => {
	getOptions(optionsInput.value, answerInput)
})

addCopyEvent();

function addCopyEvent() {
	let copyBtns = Array.from(document.querySelectorAll("div.wrap div:nth-child(1) button"));
	let inputs = [rowInput, textInput, answerInput, optionsInput, quoteInput];
	for (let i = 0; i < inputs.length; i++) {
		copyBtns[i].addEventListener("click", () => {
			copyData(inputs[i].value.toString());
		})
	}
}

hideCards()

function hideCards() {
	let cards = document.querySelectorAll("div.wrap");
	cards.forEach((card) => {
		let label = card.querySelector("label");
		label.addEventListener("click", () => {
			let other = card.querySelectorAll("div:nth-child(n+2),input:nth-child(n+2), textarea:nth-child(n+2), select:nth-child(n+2)");
			other.forEach((oth) => {
				if (oth.classList.contains("d-none")) {
					oth.classList.remove("d-none");
				} else {
					oth.classList.add("d-none");
				}
			})
		})
	})
}
function getBibleText(quote) {
	if (quote === "") {
		showToast("Empty quote", "error");
		return
	}
	screenLoad.classList.remove("d-none");
	fetch("/bible", {
		method: "POST",
		body: JSON.stringify({"quote": quote}),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((data) => {
		if (data.status != 200) {
			throw new Error(`Error parsing quote "${quote}"`);
		}
		return data.json();
	}).then((data) => {
		screenLoad.classList.add("d-none");
		parseVerses(data, quote)
		modal.show();

	}).catch((err) => {
		screenLoad.classList.add("d-none");
		showToast(err, "error");
	})
}

function updateRow() {
	screenLoad.classList.remove("d-none");
	let values = {
		row: rowInput.value,
		text: textInput.value,
		answer: answerInput.value,
		options: optionsInput.value,
		quote: quoteInput.value
	}
	fetch("/update", {
		method: "POST",
		body: JSON.stringify(values),
		headers: {
			"Content-Type": "application/json"
		},
	}).then((data) => {
		return data.json();
	}).then((data) => {
		if (data.error == true) {
			throw new Error(err.msg);
		}
		screenLoad.classList.add("d-none");
		showToast("successfully updated!", "success")
	}).catch((err) => {
		screenLoad.classList.add("d-none");
		showToast(err, "error")
	})
}

function getRow() {
	screenLoad.classList.remove("d-none");
	fetch("/fetch")
		.then((data) => {
			// if (data.status != 200) {
			// 	throw new Error("server returned error");
			// }
			return data.json();
		})
		.then((data) => {
			if (data.error == true) {
				throw new Error(data.msg);
			}
			rowInput.value = data.row;
			textInput.value = data.text;
			getOptions(data.options, answerInput);
			quoteInput.value = data.quote;
			optionsInput.value = data.options;
			screenLoad.classList.add("d-none");
		})
		.catch((err) => {
			screenLoad.classList.add("d-none");
			showAlert(err, "alert-danger")
		});
}

function getOptions(options, select) {
	select.innerHTML = "";
	for (const opt of options.split("|")) {
		let optElement = document.createElement("option");
		optElement.value = opt;
		optElement.text = opt;
		select.add(optElement);
	}
}

function showAlert(msg, category) {
	let alerts = ["alert-info", "alert-danger", "alert-success"]
	for (const alert of alerts) {
		if (alertDiv.classList.contains(alert)) {
			alertDiv.classList.remove(alert);
		}
	}
	alertDiv.classList.remove("d-none");
	alertDiv.classList.add(category)
	alertDiv.innerHTML = "";
	alertDiv.insertAdjacentHTML("afterbegin", `<p>${msg}</p>`);
	setTimeout(() => {
		alertDiv.classList.add("d-none");
	}, 3000)
}


function showToast(msg, type) {
	let icon = toastAlert.querySelector("i");
	if (type == "success") {
		icon.classList.remove("bi-exclamation-circle-fill");
		icon.classList.add("bi-check-lg");
		toastAlert.style.backgroundColor = "#d9f3d3"
		icon.style.removeProperty("color")
		icon.style.color = "#5b7555";
		toastMsg.style.color = "#5b7555"
	} else {
		icon.classList.remove("bi-check-lg");
		icon.classList.add("bi-exclamation-circle-fill");
		toastAlert.style.backgroundColor = "rgba(242,198,195,255)"
		icon.style.removeProperty("color")
		icon.style.color = "#bb1832"
		toastMsg.style.color = "#bb1832"
	}
	toastMsg.innerText = msg;
	toast.show();
}

function parseVerses(verses, quote) {
	modalBody.innerHTML = "";
	for (const verse of verses) {
		modalTitle.innerText = quote;
		let p = document.createElement("p");
		let span = document.createElement("strong");
		let spanText = document.createElement("span");
		span.innerText = verse.verse;
		span.style.marginRight = "5px"
		spanText.innerText = verse.text;
		p.appendChild(span);
		p.appendChild(spanText);
		modalBody.appendChild(p);
	}
}

function choice(items) {
	return items[Math.floor(Math.random() * items.length)];
}

function shuffle() {
	let options = optionsInput.value.split("|");
	let shuffled = options
		.map(value => ({value, sort: Math.random()}))
		.sort((a, b) => a.sort - b.sort)
		.map(({value}) => value);
	optionsInput.value = shuffled.join("|");
}

function copyData(data) {
	navigator.clipboard.writeText(data);
}
