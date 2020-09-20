
module.exports = {
    name: 'reload',
    args: true,
    category: 'dev',
    usage: 'reload <command name>',
    aliases: ['r'],
    description: 'Reloads the provided command in argument',
    execute(message, args) {
        const cmdName = args[0].toLowerCase();
        const command = message.client.commands.get(cmdName);

        // if the command doesn't exist notify the user
        if (!command) return message.channel.send(`There is no command with the name ${cmdName}`);

        // delete the file you want to reload from cache
        const category = command.category;
        delete require.cache[require.resolve(`./${category}/${cmdName}.js`)];

        // reload the file
        try {
            let newCmd;
            if (category) {
                newCmd = require(`./${category}/${cmdName}.js`);
            } else {
                newCmd = require(`./${cmdName}.js`);
            }
            message.client.commands.set(newCmd.name, newCmd);
        } catch (error) {
            return message.channel.send(`There was an error while reloading a command '${cmdName}' :`+
            ` \n ${error.message}`);
        }

        return message.channel.send(`${cmdName} was reloaded!`);
    },
};
