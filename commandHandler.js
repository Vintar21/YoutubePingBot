const config = require("./config.json")

class CommandHandler {

    constructor(client) {
        this.client = client;
        const channels = client.channels;
        this.discordChannel = channels.cache.find((channel) => channel.name === config.channelName && channel.type === 'text');
    }

    client;
    prefix = '!'
    url = config.youtubers[0];
    discordChannel;
    timeoutMention = 12 * 3600 * 1000;
    timeCheck = 30 * 1000;

    /** Executes user commands contained in a message if appropriate. */
    async handleMessage(message) {
        if (this.canRunCommand(message) && message.content[0] === this.prefix) {

            if(message.content.startsWith(`${this.prefix}help`)) {
                const commandsMessage = 
                `\r\n__**Commands**__\r\n
                -**${this.prefix}help**: Display this help
                -**${this.prefix}channel** *your youtube channel url*: Set the youtube channel to watch
                -**${this.prefix}mention** *number of hours*: Set the interval of time in hours between two mention to "everyone" in message. You can use 0.5 for 30 minutes
                -**${this.prefix}prefix** *new prefix*: Set a new prefix for this discord bot
                -**${this.prefix}settings**: Display the current settings of the bot\r\n
                `;
                const restartMesssage = "Please note that your setup will be lost if the bot need to restart or is disconnected. Some default parameters will be loaded after the bot restart.\r\n";
                const contactMessage = "\r\nFor any other problem or demand please contact @Vintar#8357";

                await message.reply(commandsMessage + restartMesssage + contactMessage);
            }

            if (message.content.startsWith(`${this.prefix}channel `)) {
                const channelId = message.content.replace( `${this.prefix}channel <#`, '').replace('>', '');
                this.discordChannel = this.client.channels.cache.get(channelId);
                await message.reply(`Discord channel to send notifications is now <#${this.discordChannel.id}>`);
            }

            if (message.content.startsWith(`${this.prefix}url `)) {
                this.url = message.content.replace( `${this.prefix}url `, '');
                await message.reply(`Youtube channel to watch is now: ${this.url}`);
            }

            // if (message.content.startsWith(`${this.prefix}check `)) {
            //     this.timeCheck = Number(message.content.replace( `${this.prefix}check `, '')) * 1000;
            //     await message.reply(`I will now check for new videos each ${this.timeCheck/1000} seconds`);
            // }
            //-**${this.prefix}check** *number of seconds*: Set the interval of time between two check of new videos (min 20 sec)


            if (message.content.startsWith(`${this.prefix}mention `)) {
                this.timeoutMention = Number(message.content.replace( `${this.prefix}mention `, ''))* 3600 * 1000;
                await message.reply(`I will now mention user maximum one time each ${this.timeoutMention/3600000} hours`);
            }

            if (message.content.startsWith(`${this.prefix}prefix `)) {
                this.prefix = message.content.replace( `${this.prefix}prefix `, '');
                await message.reply(`My new prefix for commands is now ${this.prefix}`);
            }

            if (message.content.startsWith(`${this.prefix}settings`)) {
                const settingsMessage = `
                My  prefix is **${this.prefix}**
                I check the channel ${this.url} each **${this.timeCheck/1000} seconds** to see if new videos were published.
                When new videos were published, I send a notification in <#${this.discordChannel.id}> where I can only mention the role "everyone" each **${this.timeoutMention/3600000} hours**.
                `
                await message.reply(settingsMessage);
            }
             
        }        
    }

    canRunCommand(message) {
        const author = message.author;
        return !author.bot && message.member.hasPermission("ADMINISTRATOR");

    }
}

module.exports = CommandHandler
