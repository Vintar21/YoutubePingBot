# YoutubePingBot

A Bot that send a message when you publish a youtube video (with a timeout to ping @everyone)

The bot check each 30 seconds if a new video has been published. If any it send a message and can only ping @everyone if its last message was sent at least 12 hours ago to avoid spamming.
Messages are sent in the channel specified in channelName in your config.json
If several videos were published at the same time it only send one message.

You can manage some settings with commands, type **!help** for more information.

Based on the template: https://github.com/Androz2091/DiscordYoutubeNotifier
