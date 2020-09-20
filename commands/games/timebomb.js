const {TB} = require('../../constants/emojis');
const {TimeBomb, Player} = require('./timebomb_classes');
const Discord = require('discord.js');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'timebomb',
    args: false,
    category: 'games',
    usage: 'timebomb',
    aliases: ['tb'],
    description: `Launch a time bomb game with every people in your voice channel ! ${TB.DESCRIPTION}`,
    execute(message, args) {
        const authorChannel = message.member.voice.channel;
        if (!authorChannel) {
            return message.reply('You need to join a voice channel to do this !');
        }

        const members = authorChannel.members;
        const nbrOfPlayers = members.size;
        if (nbrOfPlayers < 4 || nbrOfPlayers > 8) {
            return message.channel.send('You need to be 4 to 8 players for this game !');
        }

        // Create a new game and put every member of the voice channel in the list of players
        const playersList = [];
        members.each((m) => {
            const player = new Player(m.user.id, m.displayName);
            playersList.push(player);
        });
        const game = new TimeBomb(playersList, TB.DEFUSER, TB.NEUTRAL, TB.BOMB);

        // Attribute the 'team' property for every player in the game, and send them a DM to
        // inform them of their team.
        game.teamAttribution(TB.GOOD, TB.EVIL);
        game.players.map((player) => {
            const m = members.find((m) => m.displayName===player.name);
            m.send(`**You're team ${player.team}, Good Luck !**`);
        });

        let pickingPlayer = game.getRandomPlayer();

        const TimeBombEmbed = new Discord.MessageEmbed()
            .setColor('LIGHT_GREY')
            .setTitle('A new game of TimeBomb has started')
            .setDescription(TB.DESCRIPTION);
        message.channel.send(TimeBombEmbed);

        (async () => {
            // This loop represent each turn, max 4 turns in the game, every turn players cards are changed
            for (let turn=0; turn<4; turn++) {
                message.channel.send('** New turn, check your DMs ! **');
                game.handsAttribution();
                game.players.map((p) => {
                    const m = members.find((m) => m.displayName===p.name);
                    m.send(`Your hand : ${p.hand}`);
                });

                // Every turn players pick (nbOfPlayers) cards
                for (let i=0; i<nbrOfPlayers; i++) {
                    message.channel.send(`Still ${nbrOfPlayers-i} card(s) to pick ||`+
                        ` ${game.defuserCount}/${nbrOfPlayers} ${TB.DEFUSER} found`+
                        `\n <@${pickingPlayer.id}> Choose a player to pick from ! (Just use @)`);

                    let pickedPlayer;
                    try {
                        pickedPlayer = await getUserChoice(message.channel, game.players, pickingPlayer);
                    } catch (e) {
                        log.file.error('TIMEBOMB COLLECTOR : '+e.message);
                        return message.channel.send(`Something went wrong while waiting for your message!`);
                    }

                    const pickedCard = pickedPlayer.getRandomCardFromHand();
                    message.channel.send(pickedCard);
                    game.removeFromDeck(pickedCard);
                    pickedPlayer.removeFromHand(pickedCard);

                    switch (pickedCard) {
                    case TB.NEUTRAL:
                        break;
                    case TB.BOMB:
                        return message.channel.send(`The bomb has been found ! ${TB.EVIL} won...`+
                            ` Well played to ${game.getNamesOfEvilTeam(TB.EVIL)}`);
                    case TB.DEFUSER:
                        game.defuserCount++;
                        if (game.defuserCount===nbrOfPlayers) {
                            return message.channel.send(`The bomb has been defused ! ${TB.GOOD} won !`+
                                ` Well played to ${game.getNamesOfGoodTeam(TB.GOOD)}`);
                        }
                        break;
                    }
                    // The picked player becomes the next picking player
                    pickingPlayer = pickedPlayer;
                }
            }
            return message.channel.send(`The time has expired... The bomb exploded ! ${TB.EVIL} won...`+
                ` Well played to ${game.getNamesOfEvilTeam(TB.EVIL)}`);
        })();
    },
};

/** Wait for the user to enter a choice in the channel and fetch it
 * @param {Channel} channel the discord channel where the game is played
 * @param {Player[]} playersList list of all the players in the game
 * @param {Player} pickingPlayer the player that is choosing
 * @return {Player} return the player that was chosen by the user
 */
async function getUserChoice(channel, playersList, pickingPlayer) {
    // Check that the message we collect :
    const filter = (m) => {
        const authorIsPicking = (m.author.id === pickingPlayer.id);
        if (authorIsPicking) { // 1. is written by the pickingPlayer
            if (m.mentions.users.first() !== undefined) { // 2. contains a mention
                const mentionned = m.mentions.users.first();
                if (mentionned.id === pickingPlayer.id) { // 3. the user didn't mention himself
                    channel.send(`You cannot pick yourself ! Cheater...`);
                } else {
                    const pickedPlayer = playersList.find((player) => mentionned.id===player.id);
                    if (!pickedPlayer) { // 4. the mention is a player of th game
                        channel.send(`This is not a player of the game !`);
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const result = await channel.awaitMessages(filter, {max: 1, time: 24000})
        .then((collected) => {
            const mentionned = collected.first().mentions.users.first();
            return playersList.find((player) => mentionned.id===player.id);
        })
        .catch((error) => {
            throw error;
        });

    return result;
};
