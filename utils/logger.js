const Settings = require('../db/models/settings');

async function logToChannel(guild, client, message) {
  const settings = await Settings.findOne({ guildId: guild.id });
  if (!settings || !settings.logChannelId) return;

  const channel = client.channels.cache.get(settings.logChannelId);
  if (!channel) return;

  channel.send(message);
}

module.exports = { logToChannel };
