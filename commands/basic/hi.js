const {EMOJIS, FLAGS} = require('../../constants/emojis');

module.exports = {
    name: 'hi',
    args: false,
    category: 'basic',
    usage: 'hi',
    aliases: [],
    description: 'Say hi to the bot and he will respond with a personnalized message (i.e "Hello @User!")',
    execute(message, args) {
        const id = message.author.id;
        const lastDigit = id[id.length-1];
        const author = message.author.toString();
        let hiMessage;

        switch (lastDigit) {
        case '0':
            hiMessage = `Salut mon giga bro ${author} ${EMOJIS.FACE_WITH_HEARTS}`;
            break;
        case '1':
            hiMessage = `Ah gros on est là le confinement tu connais ${EMOJIS.ONE_HUNDRED}`;
            break;
        case '2':
            hiMessage = `FTG ${author} !`;
            break;
        case '3':
            hiMessage = `Bonjour from ${FLAGS.FRENCH}, ${author}!`;
            break;
        case '4':
            hiMessage = `Toujours en train de coder tmtc ${EMOJIS.PROGRAMMER}`;
            break;
        case '5':
            hiMessage = `Coucou ${EMOJIS.WAVING_HAND}`;
            break;
        case '6':
            hiMessage = `Pas le temps, je suis à la salle avec Ryo là ${EMOJIS.MECHANICAL_ARM}`;
            break;
        case '7':
            hiMessage = `Go faire de l'escrime ensemble ${EMOJIS.FENCING}!`;
            break;
        case '8':
            hiMessage = `Il faut sauver les rhinos frérot ${EMOJIS.RHINO}`;
            break;
        case '9':
            hiMessage = `Japon Japon ${EMOJIS.BENTO}`;
            break;
        };

        return message.channel.send(hiMessage);
    },
};
