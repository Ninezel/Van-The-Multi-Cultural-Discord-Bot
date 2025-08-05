const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../db/models/user');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Economy',
  adminOnly: true,
  usage: '/resetbalance <user>',
  data: new SlashCommandBuilder()
    .setName('resetbalance')
    .setDescription('Reset a user’s balance to 100 credits')
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
      }

      const target = interaction.options.getUser('user');
      if (target.bot) {
        return interaction.reply({ content: '🤖 Cannot reset balance for bots.', ephemeral: true });
      }

      const user = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
      user.credits = 100;
      await user.save();

      await interaction.reply(`🔄 Reset ${target.username}’s balance to **100** credits.`);
      logToChannel(interaction.guild, interaction.client, `🔁 ${interaction.user.tag} reset ${target.tag}'s balance`);
    } catch (error) {
      console.error('❌ Error in /resetbalance:', error);
      await interaction.reply({ content: '⚠️ Failed to reset balance.', ephemeral: true });
    }
  }
};
