const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Music',
  adminOnly: false,
  usage: '/skip',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip the currently playing track.'),

  async execute(interaction, client) {
    const player = client.player;
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({ content: '❌ There is no track playing to skip.', ephemeral: true });
    }

    queue.node.skip();
    await interaction.reply('⏭️ Track skipped.');
  }
};
