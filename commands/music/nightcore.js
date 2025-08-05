const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/nightcore',
  data: new SlashCommandBuilder()
    .setName('nightcore')
    .setDescription('🌙 Toggle Nightcore filter.'),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    const filters = queue.filters;
    const enabled = filters.ffmpeg.nightcore;

    if (enabled) {
      filters.ffmpeg.setFilters([]);
      return interaction.reply('🌙 Nightcore disabled.');
    } else {
      filters.ffmpeg.setFilters(['nightcore']);
      return interaction.reply('🌙 Nightcore enabled.');
    }
  }
};
