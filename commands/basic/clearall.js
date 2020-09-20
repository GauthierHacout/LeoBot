const {log} = require('../../logs/logging');

module.exports = {
    name: 'clearall',
    args: false,
    category: 'basic',
    usage: 'clearall',
    aliases: ['ca'],
    description: 'Clearall will delete the channel and recreate an identical one,\n'+
    ' effectively deleting all messages present in the channel.',
    execute(message, args) {
        const channel = message.channel;
        const position = channel.position;
        console.log('position is '+position);

        channel.clone()
            .then((clone) => {
                clone.setPosition(position)
                    .catch((e) => {
                        log.file.error('NEW CHANNEL POSITION : '+e.message);
                    });
                return clone.send('A clean new channel !');
            })
            .catch((error) => {
                log.file.error('CHANNEL CLONE : '+error.message);
            });

        channel.delete()
            .catch((error) => {
                log.file.error('CHANNEL DELETE : '+error.message);
            });
    },
};
