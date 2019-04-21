// Generates random word of specified language

var es = require('random-spanish-words');
var en = require('random-words');;


// generate 3 random words for the player to choose from:
exports.genWords = function(lang){
    var words;

    switch (lang) {
        case 'es':
            words = es({ exactly: 3 });
            break;
        case 'en':
            words = en({ exactly: 3 });
            break;
    }

    return words;
}
