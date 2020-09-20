const {shuffle} = require('../../constants/util');

/** Class representing a player of the TimeBomb game, with a team (either 'evil' or 'good')
 * a name and discord id for identification, and a hand of cards.
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
        this.hand = [];
    }

    /** Return a random card of the player hand
     * @return {*} the representation of a card (either neutral, bomb or defuser)
     */
    getRandomCardFromHand() {
        const shuffledHand = shuffle(this.hand);
        return shuffledHand.pop();
    }

    /** Remove the first occurence of the card in the hand array
     * @param {Object} card a card of the game
     */
    removeFromHand(card) {
        const cardIndex = this.hand.indexOf(card);
        this.hand.splice(cardIndex, 1);
    }
};

/** Class representing a TimeBomb game with a deck of cards a counter for the defusers found
 * and a list of players
*/
class TimeBomb {
    /** Create a new instance of the game, and fill the deck with {nbrOfPlayers} * 5 cards
     * @param {Player[]} playersList an array with every players of the game
     * @param {*} defuser the representation of a defuser card (e.g a string or an emoji)
     * @param {*} neutral the representation of a neutral card (e.g a string or an emoji)
     * @param {*} bomb the representation of a bomb card (e.g a string or an emoji)
     */
    constructor(playersList, defuser, neutral, bomb) {
        this.players = playersList;
        this.defuserCount = 0;
        this.deck = [bomb];
        // Fill the deck with (number of players * 5) cards
        for (let i=0; i<this.players.length; i++) {
            this.deck.push(defuser, neutral, neutral, neutral, neutral);
        }
        // Pop the last 'neutral' card because we have already have a 'bomb'
        this.deck.pop();
    }

    /** Return (this.players.length) hands of cards in an array (a hand can be either 5,4,3 or 2 card),
     * a hand is represented by an array of card (e.g ['neutral','neutral','bomb','defuser'])
     * @return {[]} a list of card hands.
     */
    getRandomHands() {
        const suffledDeck = shuffle(this.deck);
        const nbrOfCards = this.deck.length/this.players.length;
        let j = 0;
        const result = [];

        // Each hand is made of (nbrOfCards) cards
        for (let i=0; i<(this.players.length); i++) {
            result.push(suffledDeck.slice(j, j+nbrOfCards));
            j = j+nbrOfCards;
        }

        return result;
    };

    /** Return a players of the list of players chosen at random
     * @return {Player} a player of the game
     */
    getRandomPlayer() {
        const shuffledPlayersList = shuffle(this.players);
        return shuffledPlayersList.pop();
    };

    /** Return an array of all the players names in the game who have their 'team' property set to good
     * @param {*} good the representation of the good team (e.g a string or an emoji)
     * @return {string[]} array with players property name (e.g ['gauthier', 'leobot'])
     */
    getNamesOfGoodTeam(good) {
        const result = [];
        this.players.map( (p) => {
            if (p.team == good) {
                console.log(JSON.stringify(p));
                result.push(p.name);
            };
        });
        console.log('good'+result);
        return result;
    }

    /** Return an array of all the players names in the game who have their 'team' property set to evil
     * @param {*} evil the representation of the evil team (e.g a string or an emoji)
     * @return {string[]} array with players property name (e.g ['gauthier', 'leobot'])
     */
    getNamesOfEvilTeam(evil) {
        const result = [];
        this.players.map( (p) => {
            if (p.team == evil) {
                console.log(JSON.stringify(p));
                result.push(p.name);
            };
        });
        console.log('evil'+result);
        return result;
    }

    /** Set the 'team' property for each player in the players property
    * The number of players in each team depends on the number of players in the game
    * @param {*} good the representation of the good team (e.g a string or an emoji)
    * @param {*} evil the representation of the evil team (e.g a string or an emoji)
    */
    teamAttribution(good, evil) {
        let roles = [];
        const rand = Math.random();
        const nbrOfPlayers = this.players.length;

        switch (nbrOfPlayers) {
        case 4:
            if (rand < 0.5) {
                roles = [good, good, good, evil];
                break;
            }
            roles = [good, good, evil, evil];
            break;
        case 5:
            roles = [good, good, good, evil, evil];
            break;
        case 6:
            roles = [good, good, good, good, evil, evil];
            break;
        case 7:
            if (rand < 0.5) {
                roles = [good, good, good, good, evil, evil, evil];
                break;
            }
            roles = [good, good, good, good, good, evil, evil];
            break;
        case 8:
            roles = [good, good, good, good, good, evil, evil, evil];
            break;
        }

        // Shuffle the roles array for the order to be randomized
        const shuffledRoles = shuffle(roles);
        for (let i=0; i<this.players.length; i++) {
            this.players[i].team = shuffledRoles[i];
        }
    };

    /** Give a new hand of random cards to each player, a hand is an array of cards (either 5,4,3 or 2 cards)
     * (e.g [neutral, defuser, neutral, bomb])
     */
    handsAttribution() {
        const hands = this.getRandomHands();
        let i=0;
        this.players.map((p) => {
            p.hand = hands[i];
            i++;
        });
    }

    /** Remove the first occurence of the provided card from the deck
     * @param {string} card a card (either 'defuser', 'neutral' or 'bomb')
     */
    removeFromDeck(card) {
        const cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1);
    }
};

exports.TimeBomb = TimeBomb;
exports.Player = Player;
