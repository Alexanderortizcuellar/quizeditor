let spinner = document.querySelector("div.spin");
let screenLoad = document.querySelector("div.loading-screen");
let button = document.querySelector("button");
let alertDiv = document.querySelector("div.alert");
let textInput = document.querySelector("textarea#text");
let answerInput = document.querySelector("select#answer");
let optionsInput = document.querySelector("input#options");
let quoteInput = document.querySelector("input#quote");
let rowInput = document.querySelector("input#row");
button.addEventListener("click", ()=>{
	getRow();
})
function getRow() {
	screenLoad.classList.remove("d-none")
	fetch("/fetch")
		.then((data) => {
			// if (data.status != 200) {
			// 	throw new Error("server returned error");
			// }
			return data.json();
		}).then((data) => {
			if (data.error == true) {
				throw new Error(data.msg)
			}
			rowInput.value = data.row
			textInput.value = data.text
			getOptions(data.options, answerInput)
			quoteInput.value = data.quote
			optionsInput.value = data.options
			screenLoad.classList.add("d-none");
			
		}).catch((err) => {
			screenLoad.classList.add("d-none")
			alertDiv.classList.remove("d-none");
			alertDiv.innerHTML = "";
			alertDiv.insertAdjacentHTML("afterbegin", `<p>${err}</p>`)
			console.log(err);
		})
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
