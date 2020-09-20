const axios = require('axios');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'randomfact',
    args: false,
    category: 'knowledge',
    usage: 'randomfact',
    aliases: ['rf'],
    description: 'Leo Bot is a insatiable learner ! '+
        'He knows so much he can always teach you something interesting',
    execute(message, args) {
        const url = 'https://uselessfacts.jsph.pl/random.json';

        (async () => {
            try {
                const response = await axios.get(url, {
                    params: {
                        language: 'en',
                    },
                });

                const data = response.data;
                return message.channel.send(`\`\`\`${data.text}\`\`\``);
            } catch (error) {
                log.file.error('RANDOM FACT : '+error.message);
                return message.channel.send('An error has occurred :(');
            }
        })();
    },
};
