const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/loop <off|track|queue>',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('🔁 Set loop mode for current track or queue.')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'off', value: 'off' },
          { name: 'track', value: 'track' },
          { name: 'queue', value: 'queue' }
        )
    ),

  async execute(interaction, client) {
    const mode = interaction.options.getString('mode');
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    let loopMode;
    switch (mode) {
      case 'off': loopMode = 0; break;
      case 'track': loopMode = 1; break;
      case 'queue': loopMode = 2; break;
    }

    queue.setRepeatMode(loopMode);

    const modeText = {
      0: '🔁 Looping disabled.',
      1: '🔂 Looping current track.',
      2: '🔁 Looping entire queue.'
    };

    await interaction.reply(modeText[loopMode]);

    // ✅ Update control panel embed (if open)
    const message = queue.metadata?.controlMessage;
    const track = queue.currentTrack;
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
        text: `Loop Mode: ${loopMode === 0 ? 'Off' : loopMode === 1 ? 'Track' : 'Queue'}`
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
      console.warn('⚠️ Failed to update music panel after loop change:', err.message);
    }
  }
};
