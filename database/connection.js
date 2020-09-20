const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {log} = require('../logs/logging');


/**
 * Open a connection to a database (each discord server as a unique database) or notify the user if unable to.
 * @param {Message} message a discord.js Message Object representing the message that triggered the bot.
 * @return {Database} an open connection to the database.
 */
module.exports = function connectToDb(message) {
    // connect to the database corresponding to message's server.
    const dbPath = path.resolve(__dirname, 'discord_guild_db', `${message.guild.id}.db`);
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (error) => {
        if (error) {
            log.file.error('DATABASE : '+error.message);
            return message.channel.send('Unable to connect to the database :(');
        }
    });

    return db;
};
