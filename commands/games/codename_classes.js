
/** Class representing a word in the codename game, each word as a value (e.g 'Table') and a color
 * (either 'blue', 'red', 'white' or 'black')
 */
class Word {
    /** Create a new word
     * @param {string} value the text the word holds (e.g 'Table')
     */
    constructor(value) {
        this.value = value;
        this.color;
    };
};


/** Class representing a player of the CodeName game, with a team (either 'blue' or 'red'),
 * a role (either 'Spy' or 'Agent'), a name and discord id for identification.
 */
class Player {
    /** Create a new player
     * @param {int} id the Snowflake respresenting the player as a discord user
     * @param {string} pName the name of the player
     */
    constructor(id, pName) {
        this.id = id;
        this.name = pName;
        this.team;
        this.role;
    };
};

/** Class representing a game of codename, with a table of word & a list of players
 */
class CodeName {
    /** Create a new Codename game
     * @param {Word[]} words an array filled with Word (instance of the word class)
     * @param {Player[]} players a list of all the players in the game
     */
    constructor(words, players) {
        this.words = words;
        this.players = players;
        this.redWordDiscovered = 0;
        this.blueWordDiscovered = 0;
        this.discoveredWords = [];
    };

    /** Set up the game to be able to play !
     *  Give each word a color, each player a team and a role, shuffle all the words
     */
    setup() {
        this.wordColorAttribution();
        this.playerTeamAttribution();
        this.playerRoleAttribution();
        this.words = shuffle(this.words);
    }

    /** Set the 'team' property for every player in the game, there is the same amount of players in each team
     * ('blue' or 'red') or +1 player in the 'blue' team depending on the number of players (even or odd)
     */
    playerTeamAttribution() {
        this.players = shuffle(this.players);
        const size = this.players.length;
        for (let i=0; i<size; i++) {
            if (i < Math.floor(size/2)) {
                this.players[i].team = 'red';
            } else {
                this.players[i].team = 'blue';
            }
        }
    }

    /** Return a list with all the players in the 'blue' team
     * @return {Player[]} an array filled with instances of the Player class
     */
    getBlueTeam() {
        const blueTeam = [];
        this.players.map( (p) => {
            if (p.team === 'blue') {
                blueTeam.push(p);
            }
        });
        return blueTeam;
    }

    /** Return a list with all players in the 'red' team
     * @return {Player[]} an array filled with instances of the Player class
     */
    getRedTeam() {
        const redTeam = [];
        this.players.map( (p) => {
            if (p.team === 'red') {
                redTeam.push(p);
            }
        });
        return redTeam;
    }

    /** Return a list with the ID of the players who have the 'Spy' role
     * @return {Snowflake[]} an array of Snowflake used for Discord identification
     */
    getSpiesIDs() {
        const ids = [];
        this.players.map( (p) => {
            if (p.role==='Spy') ids.push(p.id);
        });
        return ids;
    }

    /** Set the 'role' property for every player, each team ('blue' or 'red')
     * has one 'Spy' and one or multiples 'Agent'
     */
    playerRoleAttribution() {
        const blueTeam = this.getBlueTeam();
        const redTeam = this.getRedTeam();

        for (let i=0; i<blueTeam.length; i++) {
            blueTeam[i].role = 'Agent';
        }
        for (let i=0; i<redTeam.length; i++) {
            redTeam[i].role = 'Agent';
        }

        this.redTeam = shuffle(redTeam);
        this.blueTeam = shuffle(blueTeam);
        this.redTeam[0].role = 'Spy';
        this.blueTeam[0].role = 'Spy';
    }

    /** Set the 'color' property for every Word of the words list
     * (eitheir 'blue', 'red', 'white' or 'black')
     */
    wordColorAttribution() {
        for (let i=0; i<25; i++) {
            if (i===0) {
                this.words[i].color = 'black';// ' \u{2B1B} '; // black
            } else if (i<9) {
                this.words[i].color = 'red';// ' \u{1F7E5} '; // red
            } else if (i<18) {
                this.words[i].color = 'blue';// ' \u{1F7E6} '; // blue
            } else {
                this.words[i].color = 'white';// ' \u{2B1C} '; // white
            }
        };
    };

    /** Return an array with the value of each Word in the 'words' property of the game
     * @return {string[]} an array filled with words (e.g ['Chaise', 'Table', 'Verre'])
     */
    getWordsValueList() {
        const wordList = [];
        this.words.map( (w) => {
            wordList.push(w.value);
        });
        return wordList;
    }

    /** Return the list of th words used in game with added symbols for markdown in discord
     * @return {string[]} an array of words (i.e ['< Paris >', '<Verre>', '* Chaise *', '> Table'])
     */
    getColoredWordsList() {
        const result = [];
        this.words.map( (w) => {
            switch (w.color) {
            case 'red':
                result.push(`* ${w.value} *`);
                break;
            case 'blue':
                result.push(`<${w.value}>`);
                break;
            case 'white':
                result.push(`< ${w.value} >`);
                break;
            case 'black':
                result.push(`> ${w.value}`);
                break;
            }
        });
        return result;
    };
};

exports.Player = Player;
exports.CodeName = CodeName;
exports.Word = Word;
