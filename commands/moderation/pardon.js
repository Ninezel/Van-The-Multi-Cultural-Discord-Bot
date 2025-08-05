const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Blacklist = require('../../db/models/blacklist');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/pardon <user>',
  data: new SlashCommandBuilder()
    .setName('pardon')
    .setDescription('Remove a user from the blacklist')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to unblacklist')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const result = await Blacklist.findOneAndDelete({ userId: user.id });

    if (!result) {
      return interaction.reply({ content: `ℹ️ ${user.tag} was not blacklisted.`, ephemeral: true });
    }

    await interaction.reply({ content: `✅ ${user.tag} has been pardoned.`, ephemeral: true });

    // Optional: Log to admin log channel
    logToChannel(interaction.guild, interaction.client, `✅ ${user.tag} was removed from the blacklist by ${interaction.user.tag}.`);
  }
};
