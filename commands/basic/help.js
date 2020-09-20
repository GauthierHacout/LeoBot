const {prefix} = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    args: false,
    category: 'basic',
    usage: 'help (command name)',
    aliases: ['h'],
    description: 'Help will return the list of all the existing commands, \n'+
    'or the details for a specific one if (command name) is provided!',
    execute(message, args) {
        const commandEmbed = new Discord.MessageEmbed();
        const {commands} = message.client;

        // if there is no argument display a list of all the commands
        if (!args.length) {
            const helpMap = sortByCategory(commands);

            commandEmbed.setColor('GREY')
                .setTitle(`Here's a list of all the commands`)
                .setFooter(`You can use ${prefix}help <command name> to have the info`+
                ` for a specific command`);

            for (const [category, commandNames] of helpMap) {
                // adding ** ** to style the title in the embed.
                commandEmbed.addField(`**${category}**`, `${commandNames}`, false);
            }

            return message.channel.send(commandEmbed);
        }

        // else check if the command provided in argument exists (if not notify the message's author)
        const cmdName = args[0].toLowerCase();
        const command = commands.get(cmdName) || commands.find((cmd) => cmd.aliases.includes(cmdName));

        if (!command) {
            return message.reply(`that's not an existing command, use ${prefix}help to`+
            ` see a list of the commands !`);
        }

        // send the specific info about the command
        commandEmbed.setColor('GREY')
            .setTitle(`${command.name}`)
            .addFields(
                {name: 'Usage', value: `${prefix}${command.usage}`},
                {name: 'Description', value: `${command.description}`},
            );

        if (command.aliases.length!=0) {
            let data = '';
            command.aliases.forEach((alias) => {
                data += `\`${alias}\` `;
            });
            commandEmbed.addField('Aliases', `${data}`);
        }

        return message.channel.send(commandEmbed);
    },
};


/**
 * Sort all the commands names by category into a Map such as :
 * key=category and value=commandsNames (i.e "quote" => "listquote addquote quote")
 * @param {Map} commands a Map with every command that the discord bot handles as object.
 * @return {Map} returns a Map with categories as keys and string of commands names as values.
 */
function sortByCategory(commands) {
    const sortedMap = new Map();

    commands.map( (cmd) => {
        // don't add the dev commands to the help informations
        if (cmd.category != 'dev') {
            if (sortedMap.has(cmd.category)) {
                // adding ` ` to style the command name in the embed.
                sortedMap.set(`${cmd.category}`, sortedMap.get(cmd.category)+`\`${cmd.name}\` `);
            } else {
                sortedMap.set(`${cmd.category}`, `\`${cmd.name}\` `);
            }
        }
    });

    return sortedMap;
};
