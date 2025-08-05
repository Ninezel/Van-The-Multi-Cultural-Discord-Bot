const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/volume <1-100>',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('🔊 Set the playback volume.')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume level (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const level = interaction.options.getInteger('level');
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    queue.node.setVolume(level);
    await interaction.reply(`🔊 Volume set to **${level}%**`);

    // 🔁 Update music panel embed if it's open
    const message = queue.metadata?.controlMessage;
    if (!message) return;

    const track = queue.currentTrack;
    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`**[${track?.title ?? 'Unknown'}](${track?.url ?? '#'})**`)
      .addFields(
        { name: '⏱️ Duration', value: track?.duration ?? '??:??', inline: true },
        { name: '🙋 Requested by', value: track?.requestedBy?.username ?? 'Unknown', inline: true },
        { name: '🔊 Volume', value: `${level}%`, inline: true }
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
      console.error('❌ Failed to update volume in panel:', err.message);
    }
  }
};
