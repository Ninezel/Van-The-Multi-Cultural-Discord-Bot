const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/play <query>',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or other sources.')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The song name or URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const { track } = await player.play(channel, query, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.client,
            requestedBy: interaction.user
          }
        }
      });

      const embed = new EmbedBuilder()
        .setTitle('🎶 Now Playing')
        .setDescription(`[${track.title}](${track.url})`)
        .addFields(
          { name: 'Duration', value: track.duration, inline: true },
          { name: 'Requested By', value: interaction.user.username, inline: true }
        )
        .setThumbnail(track.thumbnail)
        .setColor(0x1DB954);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_pause').setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_resume').setEmoji('▶️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Primary)
      );

      await interaction.followUp({ embeds: [embed], components: [row] });

    } catch (err) {
      console.error('Play command error:', err);
      return interaction.followUp({ content: '❌ Failed to play the song.', ephemeral: true });
    }
  }
};
