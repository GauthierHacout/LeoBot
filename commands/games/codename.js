const Discord = require('discord.js');
const AsciiTable = require('ascii-table');
const {CD} = require('../../constants/database');
const {fromArrayToMatrix} = require('../../constants/util');
const {Player, CodeName, Word} = require('./codename_classes');
const connectToDb = require('../../database/connection');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'codename',
    args: false,
    category: 'games',
    usage: 'codename',
    aliases: ['cn'],
    description: 'Play a game of codenames, two teams battle each other to find all the secret words',
    execute(message, args) {
        const codenameEmbed = new Discord.MessageEmbed()
            .setColor('LIGHT_GREY')
            .setTitle('A new game of codename has started');

        const authorChannel = message.member.voice.channel;
        if (!authorChannel) {
            return message.reply('You need to join a voice channel to do this !');
        }

        const members = authorChannel.members;
        const nbrOfPlayers = members.size;
        if (nbrOfPlayers < 4) {
            return message.channel.send('You need to be at least 4 players for this game !');
        }

        // Put every member of the voice channel in the list of players
        const playersList = [];
        members.each((m) => {
            const player = new Player(m.user.id, m.displayName);
            playersList.push(player);
        });

        (async () => {
            let words;
            try {
                // Fetch 25 random words from the database
                words = await getRandomWords(message);
            } catch (e) {
                log.file.error('CODENAME DATABASE : '+ e.message);
                return message.channel.send(`Unable to get the words from database!`);
            }

            const game = new CodeName(words, playersList);
            game.setup();

            // Inform the players of the teams
            let teamDescription = 'Blue team : ';
            game.getBlueTeam().map( (player) => {
                teamDescription += `${player.name}(${player.role})  `;
            });
            teamDescription += '\nRed team : ';
            game.getRedTeam().map( (player) => {
                teamDescription += `${player.name}(${player.role})  `;
            });
            codenameEmbed.setDescription(teamDescription);
            message.channel.send(codenameEmbed);

            // Send a table with all the words to the players
            const wordsAsciiTable = newAsciiTable(game.getWordsValueList());
            const gameMessage = await message.channel.send(`\`\`\`md\n${wordsAsciiTable}\`\`\``);

            // Send a table with the words and their colors to the spies
            const coloredWordsAsciiTable = newAsciiTable(game.getColoredWordsList());
            game.getSpiesIDs().map( (id) => {
                const m = members.find((m) => m.id===id);
                m.send(`You're the spy of your team ! You can know every words color : \n
                    \`\`\`md\n${coloredWordsAsciiTable}\`\`\``);
            });

            for (let i=0; i<25; i++) {
                let chosenWord;
                try {
                    // Wait for the players to choose a word to discover
                    chosenWord = await getPlayerChoice(message.channel, game);
                } catch (e) {
                    log.file.error('CODENAME CHOICE : '+e.message);
                    return message.channel.send(`Unable to get your choice!`);
                }

                game.discoveredWords.push(chosenWord);
                const gameWord = game.words.find( (w) => {
                    return w.value.toUpperCase() === chosenWord.value.toUpperCase();
                });

                // changing the value of the word to change it's color in the discord channel message
                switch (gameWord.color) {
                case 'black':
                    return message.channel.send(`You found the forbidden word :( Your team lost !`);
                case 'red':
                    gameWord.value = `* ${gameWord.value} *`;
                    game.redWordDiscovered++;
                    break;
                case 'blue':
                    gameWord.value = `<${gameWord.value}>`;
                    game.blueWordDiscovered++;
                    break;
                case 'white':
                    gameWord.value = `< ${gameWord.value} >`;
                    break;
                }

                // Check if victory conditions have been met
                if (game.redWordDiscovered === 8) {
                    const wordsAsciiTable = newAsciiTable(game.getWordsValueList());
                    gameMessage.edit(`\`\`\`md\n${wordsAsciiTable}\`\`\``);
                    return message.channel.send(`The Red team found all their words ! They won`);
                } else if (game.blueWordDiscovered === 9) {
                    const wordsAsciiTable = newAsciiTable(game.getWordsValueList());
                    gameMessage.edit(`\`\`\`md\n${wordsAsciiTable}\`\`\``);
                    return message.channel.send(`The Blue team found all their words ! They won`);
                }

                // Update the message to see the color of the chosen word
                const wordsAsciiTable = newAsciiTable(game.getWordsValueList());
                gameMessage.edit(`\`\`\`md\n${wordsAsciiTable}\`\`\``);
            };
        })();
    },
};

/** Create an AsciiTable from an Array and return it the form of a string
 * @param {Array} array an array with the content of the table (e.g ["A", "B", "C"...])
 * @return {String} (e.g "A B C D E \nF G H I J\n")
 */
function newAsciiTable(array) {
    const matrix = fromArrayToMatrix(array, 5);
    const result = new AsciiTable()
        .addRowMatrix(matrix)
        .removeBorder()
        .setJustify();

    return result.toString();
}

/** Wait for the player to enter a choice in the channel and fetch it
 * @param {Channel} channel the discord channel where the game is played
 * @param {CodeName} game the instance of the current CodeName game
 * @return {Word} return the word that was chosen by the player
 */
async function getPlayerChoice(channel, game) {
    // Check that the message we collect :
    const filter = (m) => {
        const authorIsPlayer = game.players.find( (p) => {
            return p.id===m.author.id;
        });
        if (authorIsPlayer) { // 1. is written by a player of the game
            const messageIsWord = game.words.find( (w) => {
                return m.content.toUpperCase() === w.value.toUpperCase();
            });
            if (messageIsWord) { // 2. is a word in the game
                const wordIsDiscovered = game.discoveredWords.find( (w) => {
                    return w.value.toUpperCase() === m.content.toUpperCase();
                });
                if (wordIsDiscovered) { // 3. the word hasn't already been discovered
                    return false;
                } else {
                    return true;
                }
            }
        }
        return false;
    };

    const result = await channel.awaitMessages(filter, {max: 1})
        .then((collected) => {
            const word = game.words.find( (w) => {
                return collected.first().content.toUpperCase() === w.value.toUpperCase();
            });
            collected.first().delete();
            return word;
        })
        .catch((error) => {
            throw error;
        });

    return result;
};

/** Fetch 25 randoms words from the codename table in the server's database
 * @param {Message} message an Object representing a Discord Message
 * @return {Word[]} an array full of Word
 */
async function getRandomWords(message) {
    const db = connectToDb(message);
    const sql = `SELECT ${CD.WORD} FROM ${CD.TABLE} WHERE ${CD.CATEGORY}="french" `+
    `ORDER BY RANDOM() LIMIT 25;`;

    // set of rows read
    const result = await new Promise(function(resolve, reject) {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const words = [];
                rows.forEach( (row) => {
                    words.push(new Word(row.word));
                });
                resolve(words);
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
