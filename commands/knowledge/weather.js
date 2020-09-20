const axios = require('axios').default;
const Discord = require('discord.js');
const getPathToAsset = require('../../assets/path.js');
const {weatherAPItoken} = require('../../config.json');
const {W} = require('../../constants/emojis.js');

module.exports = {
    name: 'weather',
    args: true,
    category: 'knowledge',
    usage: 'weather <place>',
    aliases: ['we'],
    description: 'Weather will get you a full forecast of the current weather for the place you want,\n'+
    'you can use either the name of a city or it\'s postal code ! (currently only avaible for',
    execute(message, args) {
        const weatherEmbed = new Discord.MessageEmbed().setColor('LIGHT_GREY');
        const search = args[0];

        (async ()=> {
            try {
                const respCoordinates = await getCoordinatesOf(search);
                const coordinates = respCoordinates[0];
                const cityName = respCoordinates[1];
                const postcode = respCoordinates[2];

                const respWeather = await getWeatherOf(coordinates);
                const currentWeather = respWeather.data.currently;
                const currentDate = new Date((currentWeather.time)*1000);
                const weatherIconPath = getPathToAsset('weather', currentWeather.icon);

                weatherEmbed
                    .setTimestamp(currentDate)
                    .setThumbnail('attachment://icon.png')
                    .setTitle(`${currentWeather.summary} à ${cityName} (${postcode})`)
                    .setDescription(
                        // eslint-disable-next-line max-len
                        `${W.THERMOMETER} Température : ${currentWeather.temperature}°C, ressenti : ${currentWeather.apparentTemperature}°C
                        \n${W.WIND} Vents : ${currentWeather.windSpeed} km/h
                        \n${W.UV} Indice UV : ${currentWeather.uvIndex}
                        \n${W.WATER} Humidité : ${currentWeather.humidity*100}%
                        \n${W.RAIN} Probabilité de précipitation : ${currentWeather.precipProbability*100}%`);

                return message.channel.send({
                    embed: weatherEmbed,
                    files: [{attachment: weatherIconPath, name: 'icon.png'}],
                });
            } catch (e) {
                return message.channel.send(`${e.message}`);
            }
        })();
    },
};

/**
 * getCoordinatesOf will fetch the longitude and latitude of a given place from the gouv adresse-api
 * @param {string} place either the name of the city or it's postcode
 * @return {Array} the coordinates of the place + it's name and postcode
 */
async function getCoordinatesOf(place) {
    try {
        const result = await axios.get('http://api-adresse.data.gouv.fr/search', {
            params: {
                q: `${place}`,
                limit: 1,
                type: 'municipality',
                autocomplete: 0,
            }});

        const data = result.data.features[0];
        if (!data || data.properties.score<0.5) {
            throw new Error('This city doesn\'t seem to be in France');
        }
        const cityName = data.properties.city;
        const postcode = data.properties.postcode;

        return [data.geometry.coordinates, cityName, postcode];
    } catch (error) {
        throw error;
    }
};

/**
 * getWeatherOf will fetch the current weather for a provided place.
 * @param {Float64Array} coordinates an array with the longitude and latitude of a place in France
 * @return {JSON} the full forecast for the weather
 */
async function getWeatherOf(coordinates) {
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    try {
        const result = await axios
            .get(`https://api.darksky.net/forecast/${weatherAPItoken}/${latitude},${longitude}`, {
                params: {
                    exclude: 'minutely,hourly,alerts,flags,daily',
                    lang: 'fr',
                    units: 'ca',
                }});
        return result;
    } catch (error) {
        throw error;
    }
};
