const connectToDb = require('../../database/connection.js');
const {QUOTES} = require('../../constants/database');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'deletequote',
    args: true,
    category: 'quote',
    usage: 'deletequote <ID>',
    aliases: ['dq'],
    description: 'Deletequote will delete the quote, associated with the provided ID, from database',
    execute(message, args) {
        const quoteID = args[0].toLowerCase();

        // open a db connection to the discord database and delete the quote.
        const db = connectToDb(message);
        const sql = `DELETE FROM ${QUOTES.TABLE} WHERE id=?;`;

        // using function() instead of () => because we need 'this' binding.
        db.run(sql, [quoteID], function(err) {
            if (err) {
                log.file.error('DELETE QUOTE : '+err.message);
                return message.channel.send('There was an error trying to delete this quote :(');
            }

            if (this.changes) {
                return message.channel.send(`Quote successfully deleted with ID : ${quoteID}`);
            }
            return message.channel.send(`No quote with this ID !`);
        }),

        db.close((err) => {
            if (err) {
                throw err;
            }
        });
    },
};
