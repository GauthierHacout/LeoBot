const Discord = require('discord.js');
const {COUNTRIES} = require('../../constants/database');
const connectToDb = require('../../database/connection.js');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'flags',
    args: false,
    category: 'games',
    usage: 'flags',
    aliases: ['fg'],
    description: 'Play a game of flags, multiple players battle each other in order to'+
    ' find who has the most knowledge !',
    execute(message, args) {
        if (args[0]==='rename') {
            try {
                msg = renameCountry(message, args);
                return message.channel.send(msg);
            } catch (e) {
                log.file.error('RENAME FLAGS : '+ e.message);
                return message.channel.send('An issue occured while trying to rename');
            }
        }

        const flagsEmbed = new Discord.MessageEmbed()
            .setColor('LIGHT_GREY')
            .setTitle('Guess the flag !');

        const resultEmbed = new Discord.MessageEmbed()
            .setColor('LIGHT_GREY')
            .setTitle('Result of the quizz !');

        (async () => {
            let countries;
            try {
                countries = await getRandomCountries(message);
                console.debug(countries);
            } catch (e) {
                log.file.error('DATABASE COUNTRIES : '+e.message);
                return message.channel.send(`Unable to get countries and flags from the database`);
            }

            const flagQuizz = new FlagQuizz(countries);

            for (const [name, code] of flagQuizz.countries) {
                log.console.info(`Country to be found : ${name}, ${code}`);
                flagsEmbed.setImage(`https://www.countryflags.io/${code}/flat/64.png`);
                message.channel.send(flagsEmbed);

                let winnerID;
                try {
                    winnerID = await getPlayerInput(message.channel, name);
                } catch (e) {
                    message.channel.send(`You didn't find this one (${name})! Moving on...`);
                }

                flagQuizz.updatePlayerScore(winnerID);
            }

            resultEmbed.setDescription(flagQuizz.getAllScores());
            return message.channel.send(resultEmbed);
        })();
    },
};

/** renameCountry will update the name of a country in the database
 * @param {Message} message an Object representing a Discord Message
 * @param {Array} args an array filled with the arguments the user typed when using the command
 * @return {String} A message to inform the user of what happened
 */
function renameCountry(message, args) {
    const oldName = args[1];
    let newName = '';
    for (let i=2; i<args.length; i++) {
        newName += `${args[i]} `;
    }
    newName = newName.substring(0, newName.length - 1);

    const db = connectToDb(message);
    const sql = `UPDATE ${COUNTRIES.TABLE} SET ${COUNTRIES.NAME}=? WHERE ${COUNTRIES.NAME}=?`;
    db.run(sql, [newName, oldName], function(err) {
        if (err) {
            log.file.error('DATABASE FLAGS : '+ err.message);
            return 'Unable to update the name :(';
        }
    });

    db.close((err) => {
        if (err) {
            throw err;
        }
    });

    return `Renamed ${args[1]} into ${newName}!`;
};

/** Fetch 20 randoms countries from the countries table in the server's database
 * @param {Message} message an Object representing a Discord Message
 * @return {Map} a Map full of countries names and codes (e.g "France", "FR")
 */
async function getRandomCountries(message) {
    // open a db connection to the discord database and fetch 20 random country name and code.
    const db = connectToDb(message);
    const sql = `SELECT ${COUNTRIES.NAME}, ${COUNTRIES.CODE} FROM ${COUNTRIES.TABLE} `+
                `ORDER BY RANDOM() LIMIT 20;`;

    const result = await new Promise(function(resolve, reject) {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const countries = new Map();
                rows.forEach( (row) => {
                    console.debug('COUNTRY : ' +JSON.stringify(row));
                    countries.set(row.Name, row.Code);
                });
                console.debug('COUNTRIES : ' +JSON.stringify(countries));
                resolve(countries);
            }
        });
    });

    db.close((err) => {
        if (err) {
            throw err;
        }
    });

    return result;
};

/** Wait for the player to find the right answer and return the player's Discord ID
 * @param {Channel} channel the discord channel where the game is played
 * @param {String} answer the answer of the quizz (the name of the country)
 * @return {int} return the Snowflake representing the player as a discord user
 */
async function getPlayerInput(channel, answer) {
    // Check that the message we collect :
    const filter = (m) => {
        return m.content.toUpperCase() === answer.toUpperCase();
    };

    const result = await channel.awaitMessages(filter, {max: 1, time: 30000, errors: ['time']})
        .then((collected) => {
            channel.send(`Well played ${collected.first().author}!`);
            return collected.first().author;
        })
        .catch((error) => {
            throw error;
        });

    return result;
};

/** Class representing a game of flag quizz, with a map of countries & a map of players
 */
class FlagQuizz {
    /** Create a new FlagQuizz game
    * @param {Map} countries a Map filled with countries names and codes (e.g "France", "FR")
    */
    constructor(countries) {
        this.countries = countries;
        this.players = new Map();
    };

    /**
     * Update the score of one player in the game because he won a round
     * @param {int} playerID the Snowflake representing the player as a discord user
     */
    updatePlayerScore(playerID) {
        const players = this.players;
        if (players.has(playerID)) {
            players.set(playerID, players.get(playerID)+1);
        } else {
            players.set(playerID, 1);
        }
    }

    /**
     * Fetch every ID and score of each player in the game
     * @return {string} a string containing every ID and score (e.g '12354638 : 3 | 4564647 : 2 ')
     */
    getAllScores() {
        let result = '';
        for (const [player, score] of this.players) {
            result += ` ${player} : ${score} |`;
        }
        return result;
    }
};
