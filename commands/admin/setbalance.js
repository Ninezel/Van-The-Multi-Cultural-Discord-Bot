const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../db/models/user');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Economy',
  adminOnly: true,
  usage: '/setbalance <user> <amount>',
  data: new SlashCommandBuilder()
    .setName('setbalance')
    .setDescription('Set a user’s credit balance (Admin only)')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('New balance')
        .setMinValue(0)
        .setRequired(true)),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
      }

      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      if (target.bot) {
        return interaction.reply({ content: '🤖 You cannot set balance for bots.', ephemeral: true });
      }

      const user = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
      user.credits = amount;
      await user.save();

      await interaction.reply(`✅ Set ${target.username}’s balance to **${amount}** credits.`);
      logToChannel(interaction.guild, interaction.client, `🔧 ${interaction.user.tag} set ${target.tag}'s balance to ${amount}`);
    } catch (error) {
      console.error('❌ Error in /setbalance:', error);
      await interaction.reply({ content: '⚠️ Failed to set balance.', ephemeral: true });
    }
  }
};
