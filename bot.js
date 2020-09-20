const read = require('fs-readdir-recursive');
const Discord = require('discord.js');
const {log} = require('./logs/logging');
const {token, prefix} = require('./config.json');
const express = require('express');

// Creating a new Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Initialization of the discord client (referred as bot)
client.once('ready', () => {
    log.console.info(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('Visual Studio Code');
    const app = express();
    app.get('/', (req, res) => {
        res.send('Leo bot is alive and running !');
    });
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        log.console.info('Server running on 8080...');
    });
});

client.on('error', (error) => {
    log.file.error('DISCORD CLIENT : '+error.message);
});

// Make an array with all commands (file in the commands folder) and add them in the discord bot collection.
const commandFiles = read('./commands').filter((file) => file.endsWith('.js') && !file.includes('_classes'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Check is the command exist in the bot collection.
    const command = client.commands.get(commandName) ||
                    client.commands.find((cmd) => cmd.aliases.includes(commandName));
    if (!command) {
        return message.reply('This command doesn\'t exist!');
    }

    try {
        if (command.args && !args.length) {
            return message.reply(`You didn't provide any arguments ! Try : ${prefix}${command.usage}`);
        }
        command.execute(message, args);
    } catch (error) {
        log.file.error('COMMAND EXEC : '+error.message);
        return message.reply('An error occurred while trying to execute this command !');
    }
});

client.login(token);
