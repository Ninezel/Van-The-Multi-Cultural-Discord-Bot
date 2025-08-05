const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Blacklist = require('../../db/models/blacklist');
const { logToChannel } = require('../../utils/logger'); // Optional, if used

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/blacklist <user> <reason>',
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user from using the bot')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to blacklist')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for blacklisting')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permissions to use this.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    // Prevent self or bot blacklist
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot blacklist yourself.', ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ You cannot blacklist the bot.', ephemeral: true });
    }

    const existing = await Blacklist.findOne({ userId: target.id });
    const updated = await Blacklist.findOneAndUpdate(
      { userId: target.id },
      { reason, timestamp: new Date() },
      { upsert: true, new: true }
    );

    await interaction.reply(
      `🚫 **${target.tag}** has been ${existing ? 'updated in the blacklist' : 'blacklisted'}.\n📝 Reason: ${reason}`
    );

    // Optional logging
    logToChannel?.(
      interaction.guild,
      interaction.client,
      `🚫 **${target.tag}** was blacklisted by ${interaction.user.tag}.\n📝 Reason: ${reason}`
    );
  }
};
