const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/bassboost',
  data: new SlashCommandBuilder()
    .setName('bassboost')
    .setDescription('🎧 Toggle Bass Boost filter.'),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    const filters = queue.filters;
    const enabled = filters.ffmpeg.bassboost;

    if (enabled) {
      filters.ffmpeg.setFilters([]);
      return interaction.reply('🎧 Bass Boost disabled.');
    } else {
      filters.ffmpeg.setFilters(['bassboost']);
      return interaction.reply('🎧 Bass Boost enabled.');
    }
  }
};
