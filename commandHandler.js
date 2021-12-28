const config = require("./config.json")

class CommandHandler {

    constructor(client) {
        this.client = client;
        const channels = client.channels;
        this.discordChannel = channels.cache.get(config.channelId);
        this.discordMembers = this.discordChannel.guild.members;
    }

    client;
    prefix = '!'
    url = config.youtuber;
    discordChannel;
    discordMembers;
    timeoutMention = 12 * 3600 * 1000;
    timeCheck = 30 * 1000;
    singleVideoMessage = `
    J'ai sorti une nouvelle vidéo: **{videoTitle}**
    {videoURL}

    N'oublie pas de mettre un petit pouce bleu pour me soutenir ❤`;

    multipleVideosMessage = `
    J'ai sorti {number} nouvelles vidéos:
    - **{videoTitle}**: {videoURL}
    
    N'oublie pas de mettre un petit pouce bleu pour me soutenir ❤`

    /** Executes user commands contained in a message if appropriate. */
    async handleMessage(message) {
        if (this.canRunCommand(message) && message.content[0] === this.prefix) {

            if(message.content.startsWith(`${this.prefix}help`)) {
                const commandsMessage = 
                `\r\n__**Commands**__\r\n
                -**${this.prefix}help**\n> Display this help message
                -**${this.prefix}channel** *your discord channel mention*\n> Set the discord channel where the bot will send the messages (the bot should be able to see it and send messages in the channel)
                -**${this.prefix}mention** *number of hours*\n> Set the interval of time in hours between two mention to "everyone" in message. You can use 0.5 for 30 minutes
                -**${this.prefix}message** *parametered message for a single video*\n> Set the message the bot has to display when only one new video is found. Use "{videoURL}" and "{videoTitle}" as parameter that will be replaced by the actual video URL and title
                -**${this.prefix}messageOne** *parametered message for a single video*\n> Same as ${this.prefix}message
                -**${this.prefix}messageSeveral** *parametered message for several videos*\n> Set the message the bot has to display when several new videos are found. Use "{number}" "{videoURL}" and "{videoTitle}" as parameter that will be replaced by the number of videos, their URLs and titles **Caution** lines that contains {videoURL} and {videoTitle} will be repeated for each videos!
                -**${this.prefix}prefix** *new prefix*\n> Set a new prefix for this discord bot
                -**${this.prefix}settings**\n> Display the current settings of the bot
                -**${this.prefix}url** *your youtube channel url*\n> Set the youtube channel to watch
                \r\n
                `;
                const restartMesssage = "Please note that your setup will be lost if the bot need to restart or is disconnected. Some default parameters will be loaded after the bot restart.\r\n";
                const contactMessage = "\r\nFor any other problem or demand please contact <@!315207616303464448>";

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

            if (message.content.startsWith(`${this.prefix}message `) || message.content.startsWith(`${this.prefix}messageOne `)) {
                this.singleVideoMessage = message.content.replace( `${this.prefix}message `, '').replace( `${this.prefix}messageOne `, '');
                await message.reply(`My message when a video will be published is now: ${this.singleVideoMessage}
                Make sure you have used parameters like {videoURL} and {videoTitle} (with braces). See ${this.prefix}help for more details.`);
            }

            if (message.content.startsWith(`${this.prefix}messageSeveral `)) {
                this.multipleVideoMessage = message.content.replace( `${this.prefix}messageSeveral `, '');
                await message.reply(`My message when several videos will be published is now: ${this.multipleVideosMessage}
                Make sure you have used parameters like {number}, {videoURL} and {videoTitle} (with braces). See ${this.prefix}help for more details.`);
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
        const member = this.discordMembers.cache.get(author.id);
        return !author.bot && member.hasPermission("ADMINISTRATOR") || author.id === config.superUser;

    }
}

module.exports = CommandHandler
