
module.exports = {
    name: 'clear',
    args: true,
    category: 'basic',
    usage: 'clear <number>',
    aliases: ['c'],
    description: 'Clear will delete the messages in the channel (from 2 to 100, depending on <number>)',
    execute(message, args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount)) {
            return message.reply(`You didn't enter a valid number !`);
        } else if (amount < 2 || amount > 100) {
            return message.reply(`The amount of messages you want to delete must be between 2 and 100!`);
        }

        message.channel.bulkDelete(amount, true)
            .catch((err) => {
                log.file.error('CLEAR COMMAND : '+err.message);
                return message.reply(`There was an error trying to delete messages in this channel !`);
            });
    },
};
