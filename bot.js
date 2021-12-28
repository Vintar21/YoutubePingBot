const config = require("./config.json"),
Discord = require("discord.js"),
Parser = require("rss-parser"),
CommandHandler = require("./commandHandler.js"),
parser = new Parser(),
Youtube = require("simple-youtube-api"),
youtube = new Youtube(config.youtubeKey);

// 1 day = 86400000
var lastMessage = Date.now();
var lastPing = 0;

const client = new Discord.Client({ws: {intents: Discord.Intents.ALL}});
client.login(config.token).catch(console.log);
var commandHandler;

client.on('message', (message) => {
    try {
        commandHandler.handleMessage(message);
    } catch (e) {
        console.log(`[ERR] | on message ${message.content}: ${e}`);
    }
  });
  
client.on('error', (e) => {
    console.error('Discord client error!', e);
});
  
client.on("ready", () => {
    try {
        console.log(`[!] Ready to listen youtuber!`);
        commandHandler = new CommandHandler(client);
        check();
        setInterval(check, commandHandler.timeCheck);
    } catch (e) {
        console.log(`[ERR] | on ready: ${e}`);
    }
});

/**
 * Call a rss url to get the last video of a youtuber
 * @param {string} youtubeChannelName The name of the youtube channel
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The last video of the youtuber
 */
async function getLastVideos(youtubeChannelName, rssURL){
    console.log(`[${youtubeChannelName}]  | Getting videos...`);
    let content = await parser.parseURL(rssURL);
    console.log(`[${youtubeChannelName}]  | ${content.items.length} videos found`);
    let tLastVideos = content.items.sort((a, b) => {
        let aPubDate = new Date(a.pubDate || 0).getTime();
        let bPubDate = new Date(b.pubDate || 0).getTime();
        return aPubDate - bPubDate;
    });
    tLastVideos = tLastVideos.filter((video) => new Date(video.pubDate || 0).getTime() > lastMessage);
    console.log(`[${youtubeChannelName}]  | There are "${tLastVideos ? tLastVideos.length : "err"}" new videos`);
    return tLastVideos;
}

/**
 * Check if there is a new video from the youtube channel
 * @param {string} youtubeChannelName The name of the youtube channel to check
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The video || null
 */
 async function checkVideos(youtubeChannelName, rssURL){
    console.log(`[${youtubeChannelName}] | Get the last video..`);
    let lastVideos = await getLastVideos(youtubeChannelName, rssURL);
    // If there isn't any video in the youtube channel, return
    if(lastVideos.length === 0) return console.log( `[${youtubeChannelName}] | No new video found`);
    return lastVideos;
}

/**
 * Get the youtube channel id from an url
 * @param {string} url The URL of the youtube channel
 * @returns The channel ID || null
 */
function getYoutubeChannelIdFromURL(url) {
    let id = null;
    url = url.replace(/(>|<)/gi, "").split(/(\/channel\/|\/user\/)/);
    if(url[2]) {
      id = url[2].split(/[^0-9a-z_-]/i)[0];
    }
    return id;
}

/**
 * Get infos for a youtube channel
 * @param {string} name The name of the youtube channel or an url
 * @returns The channel info || null
 */
async function getYoutubeChannelInfos(name){
    console.log(`[${name.length >= 10 ? name.slice(0, 10)+"..." : name}] | Resolving channel infos...`);
    let channel = null;
    /* Try to search by ID */
    let id = getYoutubeChannelIdFromURL(name);
    if(id){
        console.log(id);
        channel = await youtube.getChannelByID(id);
    }
    if(!channel){
        /* Try to search by name */
        let channels = await youtube.searchChannels(name);
        if(channels.length > 0){
            channel = channels[0];
        }
    }
    console.log(`[${name.length >= 10 ? name.slice(0, 10)+"..." : name}] | Title of the resolved channel: ${channel.raw ? channel.raw.snippet.title : "err"}`);
    return channel;
}

/**
 * Check for new videos
 */
 async function check(){
     try {
        console.log("Checking...");
        const youtuber = commandHandler.url;
        console.log(`[${youtuber.length >= 10 ? youtuber.slice(0, 10)+"..." : youtuber}] | Start checking...`);
        let channelInfos = await getYoutubeChannelInfos(youtuber);
        if(!channelInfos) return console.log("[ERR] | Invalid youtuber provided: "+youtuber);
        client.user.setActivity(`${channelInfos.raw.snippet.title}'s YouTube channel`, {
            type: 'WATCHING'
        });
        let videos = await checkVideos(channelInfos.raw.snippet.title, "https://www.youtube.com/feeds/videos.xml?channel_id="+channelInfos.id);
        if(!videos || videos?.length === 0) {
            console.log(`[${channelInfos.raw.snippet.title}] | No notification`);
            return;
        } 
        // before client.channels.cache.get(config.channel);
        let channel = commandHandler.discordChannel;
        if(!channel) return console.log("[ERR] | Channel not found");
        let ping = "";
        if(Date.now() - lastPing >= commandHandler.timeoutMention) {
            ping = "@everyone ";
            lastPing = Date.now();
        }

        if (videos.length === 1) {
            channel.send(ping + commandHandler.singleVideoMessage
            .replace("{videoURL}", videos[0].link)
            .replace("{videoTitle}", videos[0].title));
        } else {
            let messageToSend = commandHandler.multipleVideosMessage.replace("{number}", videos.length);
            videos.forEach((video) => {
                messageToSend = messageToSend
                .replace(/([^\n]*(\{videoURL\}|\{videoTitle\})[^\n]*)/, '$1\r\n$1')
                .replace("{videoURL}", video.link)
                .replace("{videoTitle}", video.title);
            });
            messageToSend = messageToSend.replace(/(\r\n[^\n]*(\{videoURL\}|\{videoTitle\})[^\n]*)/, '');
            channel.send(ping + messageToSend);
            console.log(ping + messageToSend);
        }
        lastMessage = Date.now();
        console.log(`[${channelInfos.raw.snippet.title}] | Notification sent !`);

     } catch (e) {
        console.log(`[ERR] | on check: ${e}`);
     } 
}
