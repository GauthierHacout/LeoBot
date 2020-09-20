const connectToDb = require('../../database/connection.js');
const {QUOTES} = require('../../constants/database');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'addquote',
    args: true,
    category: 'quote',
    usage: 'addquote <ID> <quote>',
    aliases: ['aq'],
    description: 'Addquote will add the provided quote with it\'s id to the database',
    execute(message, args) {
        const quoteID = args[0].toLowerCase();
        let quote = '';
        const author = message.author.username;

        // check if the user provided a quote with the ID.
        if (!args[1]) {
            return message.channel.send('You need to provide a quote !');
        }

        // make sure the first letter of the quote is an uppercase
        args[1] = args[1][0].toUpperCase() + args[1].slice(1);
        // reconstruct the quote has provided by the user.
        for (let i=1; i<args.length; i++) {
            quote += args[i]+' ';
        }

        // open a db connection to the discord database and insert the quote.
        const db = connectToDb(message);
        const sql = 'INSERT INTO quotes VALUES (?,?,?,CURRENT_DATE)';

        db.run(sql, [quoteID, quote, author], (err) => {
            if (err) {
                // check if a quote with this id already exists.
                if (err.message === `${QUOTES.UNIQUE_ID_ERROR}`) {
                    return message.channel.send('A quote with this ID already exists, use another one');
                } else {
                    log.file.error('ADD QUOTE DATABASE : '+err.message);
                    return message.channel.send('There was an error trying to add this quote :(');
                }
            }
            return message.channel.send(`Quote successfully added with ID : ${quoteID}`);
        }),

        db.close((err) => {
            if (err) {
                throw err;
            }
        });
    },
};
