// console.log(new Date().toLocaleDateString() == new Date().toLocaleDateString());
// console.log(new Date().getDay());
// console.log(new Date().toLocaleTimeString());
// let now = new Date();
// const yesterday = new Date(now);
// yesterday.setDate(now.getDate() - 1);
// console.log(yesterday);

/**
 * @param {string} word
 * @param {string} string
 * @param {string} removeWord
 */
function replaceWord(word, string, removeWord) {
  let lengthOfStrin = string.length;
  
  let lastIndex = string.indexOf(removeWord[removeWord.length - 1]);

  return word + string.slice(lastIndex, lengthOfStrin);
}

console.log(replaceWord("Re", "Chashma"));
