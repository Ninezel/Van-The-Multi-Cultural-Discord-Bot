require('@discord-player/downloader'); // ✅ Top of file

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player, useMainPlayer } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

const player = new Player(client);
client.player = player;

const mainPlayer = useMainPlayer();
(async () => {
  await mainPlayer.extractors.loadMulti(DefaultExtractors);
})();

player.events.on('error', (queue, error) => {
  console.error(`Player error: ${error.message}`);
});

player.events.on('connectionError', (queue, error) => {
  console.error(`Connection error: ${error.message}`);
});

module.exports = { client, player };

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

player.events.on('playerStart', async (queue, track) => {
  const message = queue.metadata?.controlMessage;
  const channel = queue.metadata?.channel;

  if (!message || !channel) return;

  const embed = new EmbedBuilder()
    .setTitle('🎵 Now Playing')
    .setDescription(`**[${track?.title ?? 'Unknown'}](${track?.url ?? '#'})**`)
    .addFields(
      { name: '⏱️ Duration', value: track?.duration ?? '??:??', inline: true },
      { name: '🙋 Requested by', value: track?.requestedBy?.username ?? 'Unknown', inline: true },
      { name: '🔊 Volume', value: `${queue.node.volume}%`, inline: true }
    )
    .setThumbnail(track?.thumbnail ?? null)
    .setFooter({
      text: `Loop Mode: ${
        queue.repeatMode === 0 ? 'Off' :
        queue.repeatMode === 1 ? 'Track' : 'Queue'
      }`
    })
    .setColor('Blue');

  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_back').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_stop').setEmoji('🛑').setStyle(ButtonStyle.Danger)
  );

  try {
    await message.edit({ embeds: [embed], components: [controls] });
  } catch (err) {
    console.warn('⚠️ Failed to auto-update control panel:', err.message);
  }
});
