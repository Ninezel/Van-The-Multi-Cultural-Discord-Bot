const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹️ Stop the music and clear the queue.'),

  async execute(interaction, client) {
    const player = client.player;
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
    }

    queue.delete();
    await interaction.reply('⏹️ Music stopped and queue cleared.');
  }
};
