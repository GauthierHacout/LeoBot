const textToSpeech = require('@google-cloud/text-to-speech');
const streamBuffers = require('stream-buffers');
const {log} = require('../../logs/logging');

module.exports = {
    name: 'speak',
    args: true,
    category: 'vocal',
    usage: 'speak <Text>',
    aliases: ['sp'],
    description: 'Make the bot come in your voice channel and litteraly speak what you\'ve just written',
    execute(message, args) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('You need to join a voice channel to do this !');
        }

        const client = new textToSpeech.TextToSpeechClient();

        (async () => {
            // The text to synthesize
            const text = args.join(' ');
            // check that the text is no more than 5000 characters
            if (text.length > 5000) {
                return message.reply('Your text is too long ! (max. 5000 characters)');
            }
            // Construct the request
            const request = {
                input: {text: text},
                // Select the language and SSML voice gender (optional)
                voice: {languageCode: 'fr-FR', name: 'fr-FR-Wavenet-B', ssmlGender: 'MALE'},
                // select the type of audio encoding
                audioConfig: {audioEncoding: 'OGG_OPUS'},
            };
            // Performs the text-to-speech request
            const [response] = await client.synthesizeSpeech(request);

            // Write the binary audio content to a local file
            // const writeFile = util.promisify(fs.writeFile);
            // await writeFile(`${__dirname}/output.ogg`, response.audioContent, 'binary');

            // creating a readableStream directly from the buffer
            const voiceReadStream = new streamBuffers.ReadableStreamBuffer({
                frequency: 1,
                chunkSize: 1024,
            });
            voiceReadStream.put(response.audioContent);

            const connection = await voiceChannel.join();
            const dispatcher = connection.play(voiceReadStream, {type: 'ogg/opus'});
            // const dispatcher = connection.play(fs.createReadStream(`${__dirname}/output.ogg`), {type: 'ogg/opus'});
            dispatcher
                .on('finish', () => {
                    connection.disconnect();
                })
                .on('error', (err) => {
                    log.file.error('DISPATCHER : '+err);
                });
        })();
    },
};
