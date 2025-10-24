console.log(new Date().toLocaleDateString() == new Date().toLocaleDateString());
console.log(new Date().getDay());
console.log(new Date().toLocaleTimeString());
let now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
console.log(yesterday);
