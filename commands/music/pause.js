const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Pause the currently playing track.'),

  async execute(interaction, client) {
    const player = client.player;
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
    }

    queue.node.pause();
    await interaction.reply('⏸️ Track paused.');
  }
};
