const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/resume',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('▶️ Resume the paused track.'),

  async execute(interaction, client) {
    const player = client.player;
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPaused()) {
      return interaction.reply({ content: '❌ There is nothing paused right now.', ephemeral: true });
    }

    queue.node.resume();
    await interaction.reply('▶️ Track resumed.');
  }
};
