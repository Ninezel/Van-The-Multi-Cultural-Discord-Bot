const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📜 View the current music queue.'),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
    }

    const tracks = queue.tracks.toArray();
    const currentTrack = queue.currentTrack;

    const itemsPerPage = 10;
    let currentPage = 0;
    const totalPages = Math.ceil(tracks.length / itemsPerPage) || 1;

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const pagedTracks = tracks.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle('🎶 Music Queue')
        .setDescription(
          `**Now Playing:** [${currentTrack?.title ?? 'Unknown'}](${currentTrack?.url ?? '#'}) \`${currentTrack?.duration ?? '??:??'}\`\n\n` +
          (pagedTracks.length > 0
            ? pagedTracks.map((track, i) =>
                `**${start + i + 1}.** [${track.title}](${track.url}) \`${track.duration}\``).join('\n')
            : '*No more tracks in the queue.*')
        )
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

      return embed;
    };

    const getButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setEmoji('⏮️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('previous')
          .setEmoji('⏪')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setEmoji('⏩')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1),
        new ButtonBuilder()
          .setCustomId('last')
          .setEmoji('⏭️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1)
      );
    };

    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [getButtons(currentPage)],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      time: 60_000
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: '⚠️ Only the command user can control this queue panel.',
          ephemeral: true
        });
      }

      switch (i.customId) {
        case 'first':
          currentPage = 0;
          break;
        case 'previous':
          if (currentPage > 0) currentPage--;
          break;
        case 'next':
          if (currentPage < totalPages - 1) currentPage++;
          break;
        case 'last':
          currentPage = totalPages - 1;
          break;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [getButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (err) {
        console.warn('Could not disable queue buttons after timeout:', err.message);
      }
    });
  }
};
