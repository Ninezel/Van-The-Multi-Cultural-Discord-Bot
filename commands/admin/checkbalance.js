const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../db/models/user');

module.exports = {
  category: 'Utility',
  adminOnly: true,
  usage: '/checkbalance <user>',
  data: new SlashCommandBuilder()
    .setName('checkbalance')
    .setDescription('Check another user’s balance (Admin only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check admin permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ You must be an Administrator to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const user = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });

    await interaction.reply(`🧾 **${target.username}** has **${user.credits}** credits.`);
  }
};
