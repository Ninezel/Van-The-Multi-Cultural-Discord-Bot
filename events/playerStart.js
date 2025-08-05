const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'playerStart',

  async execute(queue, track) {
    const message = queue.metadata?.controlMessage;
    if (!message) return;

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
      console.error('❌ Failed to update music panel:', err.message);
    }
  }
};
