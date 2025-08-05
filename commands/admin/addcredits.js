const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../db/models/user');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Economy',
  adminOnly: true,
  usage: '/addcredits <user> <amount>',
  data: new SlashCommandBuilder()
    .setName('addcredits')
    .setDescription('Add credits to a user’s balance (Admin only)')
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to add').setMinValue(1).setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const user = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
    user.credits += amount;
    await user.save();

    await interaction.reply(`✅ Added **${amount}** credits to ${target.username}.`);
    logToChannel(interaction.guild, interaction.client, `💸 ${interaction.user.tag} added ${amount} credits to ${target.tag}`);
  }
};
