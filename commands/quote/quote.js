const connectToDb = require('../../database/connection.js');
const {prefix} = require('../../config.json');
const {QUOTES} = require('../../constants/database');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'quote',
    args: true,
    category: 'quote',
    usage: 'quote <ID>',
    aliases: ['q'],
    description: 'Quote will return the specific quote with the provided <ID>, \n'+
    `you can use "${prefix}quote random" to get a random one !`,
    execute(message, args) {
        const quoteID = args[0].toLowerCase();

        if (quoteID === 'random') {
            return sendRandomQuote(message);
        }

        // open a db connection to the discord database and query the quote.
        const db = connectToDb(message);
        const sql = `SELECT ${QUOTES.QUOTE}, ${QUOTES.AUTHOR}, ${QUOTES.CREATION_DATE} `+
                    `FROM ${QUOTES.TABLE} WHERE ${QUOTES.ID}=? ;`;

        db.get(sql, [quoteID], (err, row) => {
            if (err) {
                log.file.error('QUOTE : '+err.message);
                return message.channel.send('There was an error when trying to query for this quote :(');
            }

            return row ?
                message.channel.send(row.quote+' - by '+row.author+' in '+getYear(row.creation_date)) :
                message.channel.send('There is no quote with this ID !');
        });

        db.close((err) => {
            if (err) {
                throw err;
            }
        });
    },
};

/**
 * Get a random quote from the 'quotes' table in database and send it in the message's channel.
 * @param {Message} message a discord.js message object.
 */
function sendRandomQuote(message) {
    // open a db connection to the discord database and get on random quote.
    const db = connectToDb(message);
    const sql = `SELECT ${QUOTES.QUOTE}, ${QUOTES.AUTHOR}, ${QUOTES.CREATION_DATE} `+
                `FROM ${QUOTES.TABLE} ORDER BY RANDOM() LIMIT 1;`;

    db.get(sql, [], (err, row) => {
        if (err) {
            log.file.error('RANDOM QUOTE : '+err.message);
            return message.channel.send('There was an error when trying to query for a random quote :(');
        }
        return row ?
            message.channel.send(row.quote+' - by '+row.author+' in '+getYear(row.creation_date)) :
            message.channel.send('There is currently no quotes');
    });

    db.close((err) => {
        if (err) {
            throw err;
        }
    });
}

/**
 * Get the year for a given date.
 * @param {string} date a string that represent a date with any format that has YYYY.
 * @return {string} a string with 4 characters that represents a year (i.e '2020')
 * or 'unknown' if a year couldn't be found.
 */
function getYear(date) {
    const regexYear = /[0-9]{4}/;
    const year = date.match(regexYear);

    if (year != null) {
        return year[0];
    }
    return 'unknown';
};
