const config = require("./config.json")

class CommandHandler {

    constructor(client) {
        this.client = client;
        const channels = client.channels;
        this.discordChannel = channels.cache.find((channel) => channel.name === config.channelName && channel.type === 'text');
    }

    prefix = '!'
    client;
    url = config.youtubers[0];
    discordChannel;
    timeoutMention = 12 * 3600 * 1000;
    timeCheck = 30 * 1000;

    /** Executes user commands contained in a message if appropriate. */
    async handleMessage(message) {
        if (this.canRunCommand(message) && message.content[0] === this.prefix) {

            if (message.content.startsWith(`${this.prefix}url `)) {
                this.url = message.content.replace( `${this.prefix}url `, '');
                await message.reply(`Youtube channel to watch is now: ${this.url}`);
            }

            if (message.content.startsWith(`${this.prefix}channel `)) {
                const channelId = message.content.replace( `${this.prefix}channel <#`, '').replace('>', '');
                this.discordChannel = this.client.channels.cache.get(channelId);
                await message.reply(`Discord channel to send notifications is now <#${this.discordChannel.id}>`);
            }
             
        }        
    }

    canRunCommand(message) {
        const author = message.author;
        return !author.bot && message.member.hasPermission("ADMINISTRATOR");

    }
}

module.exports = CommandHandler
