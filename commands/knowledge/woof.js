const {dogAPItoken} = require('../../config.json');
const axios = require('axios');
const {log} = require('../../logs/logging');
const Discord = require('discord.js');

module.exports = {
    name: 'woof',
    args: false,
    category: 'knowledge',
    usage: 'woof',
    aliases: ['wo'],
    description: 'Leo Bot loves dogs \u{1F436}! He knows everything about them just ask him !',
    execute(message, args) {
        const url = 'https://api.thedogapi.com/v1/images/search';
        const dogEmbed = new Discord.MessageEmbed()
            .setColor('LIGHT_GREY');

        (async () => {
            try {
                const response = await axios.get(url, {
                    params: {
                        size: 'small',
                        limit: 1,
                        has_breeds: true,
                        format: 'json',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': dogAPItoken,
                    },
                });

                const data = response.data[0];
                const breed = response.data[0].breeds[0];
                dogEmbed.setTitle(breed.name)
                    .setImage(data.url)
                    .setDescription(`
                        **Weight** : ${breed.weight.metric} kg
                        **Height** : ${breed.height.metric} cm
                        **Life span** : ${breed.life_span}
                        **Temperament** : ${breed.temperament}`);

                return message.channel.send(dogEmbed);
            } catch (error) {
                log.file.error('WOOF : '+error.message);
                return message.channel.send('An error has occurred :(');
            }
        })();
    },
};
