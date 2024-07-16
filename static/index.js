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
let modalW = document.querySelector("#exampleModal")
let modalBody = document.querySelector("div.modal-picker-body")
let modalTitle = document.querySelector("h5.modal-picker-title")

let picker = document.querySelector("a.picker")
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

function getBibleText(quote) {
	if (quote === "") {
		showAlert("No quote to display", "alert-info");
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
			throw new Error("Eror parsing quote");
		}
		return data.json();
	}).then((data) => {
		screenLoad.classList.add("d-none");
		parseVerses(data, quote)
		modal.show();

	}).catch((err) => {
		screenLoad.classList.add("d-none");
		showAlert(err, "alert-danger")
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
		showAlert("success", "alert-success")
	}).catch((err) => {
		screenLoad.classList.add("d-none");
		showAlert(err, "alert-danger");
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
