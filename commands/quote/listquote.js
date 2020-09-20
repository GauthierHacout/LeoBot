const connectToDb = require('../../database/connection.js');
const Discord = require('discord.js');
const {QUOTES} = require('../../constants/database');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'listquote',
    args: false,
    category: 'quote',
    usage: 'listquote',
    aliases: ['lq'],
    description: 'listquote will list all the quotes IDs that exist!',
    execute(message, args) {
        // creat an embed discord message to display every existing quotes.
        let quotes = '';
        const quoteEmbed = new Discord.MessageEmbed()
            .setColor('GREY')
            .setTitle('Quote IDs');

        console.log(QUOTES);
        // open a connection to the discord db and get every id that exist in table 'quotes'.
        const db = connectToDb(message);
        const sql = `SELECT ${QUOTES.ID} FROM ${QUOTES.TABLE} ORDER BY date(${QUOTES.CREATION_DATE}) ASC ;`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                log.file.error('LIST QUOTE : '+err.message);
                return message.channel.send('There was an error when trying to get all quote IDs :(');
            }
            rows.forEach( (row) => {
                // adding ` ` to style the quotes in the embed.
                quotes += `\`${row.id}\` `;
            });

            quoteEmbed.addField('\u200B', quotes, false);
            return message.channel.send(quoteEmbed);
        });

        db.close((err) => {
            if (err) {
                throw err;
            }
        });
    },
};
