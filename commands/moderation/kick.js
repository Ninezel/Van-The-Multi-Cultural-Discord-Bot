const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ModLog = require('../../db/models/modlog');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/kick <user> [reason]',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: '❌ You need Kick Members permission to use this.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot kick yourself.', ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ You cannot kick the bot.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member || !member.kickable) {
      return interaction.reply({ content: '❌ Cannot kick this user. They may have higher permissions or roles.', ephemeral: true });
    }

    try {
      await member.kick(reason);

      await ModLog.create({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'kick',
        reason,
        moderator: interaction.user.tag
      });

      logToChannel?.(
        interaction.guild,
        interaction.client,
        `👢 **${target.tag}** was kicked by **${interaction.user.tag}**\n📝 Reason: ${reason}`
      );

      await interaction.reply(`👢 Successfully kicked **${target.tag}**.\n📝 Reason: ${reason}`);
    } catch (error) {
      console.error('Kick Error:', error);
      await interaction.reply({ content: '❌ Failed to kick user. Check bot permissions or hierarchy.', ephemeral: true });
    }
  }
};
