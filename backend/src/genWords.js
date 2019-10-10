// Generates random word of specified language

var es = require('random-spanish-words');
var en = require('random-words');


// generate 3 random words for the player to choose from:
var genWords = function(lang){
    let words;

    switch (lang) {
        case 'Español':
            words = es({ exactly: 3 });
            break;
        case 'English':
            words = en({ exactly: 3 });
            break;
    }

    return words;
}
module.exports = genWords;