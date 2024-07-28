let text = '1 Corinthians 1:23'
let pattern = /^[1-3]?\s*[a-zA-Z]+\s*\d+:\d+-?\d*$/;
let result = pattern.exec(text)
console.log(result)

