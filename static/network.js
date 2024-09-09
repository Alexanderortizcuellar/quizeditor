function searchBible(query, page) {
	screenLoad.classList.remove("d-none");
	fetch(`/bible/search?query=${query}&page=${page}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.json();
		})
		.then(data => {
			screenLoad.classList.add("d-none");
			parseResults(data, query);
		})
		.catch(error => {
			screenLoad.classList.add("d-none");
			showToast(error, "error")
			console.error('There was a problem with the fetch operation:', error);
		});
}
function getBibleText(quote) {
	if (quote === "") {
		showToast("Empty quote", "error");
		return
	}
	if (!validateQuote(quote)) {
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
		parseVerses(data, quote);
		modal.show();

	}).catch((err) => {
		screenLoad.classList.add("d-none");
		showToast(err, "error");
	})
}

function updateRow() {
	let values = {
		row: rowInput.value,
		text: textInput.value,
		answer: answerInput.value,
		options: optionsInput.value,
		quote: quoteInput.value
	}
	for (const value of Object.values(values)) {
		if (value == "") {
			showToast(`Please, Complete all fields.`, "error");
			return
		}
	}
	if (!validateQuote(values.quote)) {
		return false
	}
	screenLoad.classList.remove("d-none");
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

function deleteRow(row) {
	if (rowInput.value == "") {
		showToast("Invalid Id value", "error");
		return;
	}
	screenLoad.classList.remove("d-none");
	fetch(`/delete/${row}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			row: row,
		})
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.json();
		})
		.then(data => {
			if (data.error) {
				throw new Error("Server responded with error.");
			}
			screenLoad.classList.add("d-none");
			showToast("Successfully deleted record", "success");
		})
		.catch(error => {
			screenLoad.classList.add("d-none");
			showToast(error, "error");
		});

}
