const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  category: 'Music',
  usage: '/music',
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Open the music control panel'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    const currentTrack = queue.currentTrack;

    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`**[${currentTrack?.title ?? 'Unknown'}](${currentTrack?.url ?? '#'})**`)
      .addFields(
        { name: '⏱️ Duration', value: currentTrack?.duration ?? '??:??', inline: true },
        { name: '🙋 Requested by', value: currentTrack?.requestedBy?.username ?? 'Unknown', inline: true },
        { name: '🔊 Volume', value: `${queue.node.volume}%`, inline: true }
      )
      .setThumbnail(currentTrack?.thumbnail ?? null)
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

    const controlMessage = await interaction.reply({
      embeds: [embed],
      components: [controls],
      fetchReply: true // ✅ Required to store it
    });

    // 🔁 Store it for live-updates on track change
    queue.metadata.controlMessage = controlMessage;
    queue.metadata.channel = interaction.channel;
  }
};
