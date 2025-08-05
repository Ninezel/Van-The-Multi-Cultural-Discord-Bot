const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/slowmode <seconds>',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addIntegerOption(opt =>
      opt.setName('seconds')
        .setDescription('Duration in seconds (0 to disable)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ You need Manage Channels permission.', ephemeral: true });
    }

    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply(`🐌 Slowmode set to ${seconds} second(s).`);
  }
};
