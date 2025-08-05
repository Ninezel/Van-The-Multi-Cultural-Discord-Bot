const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logToChannel } = require('../../utils/logger');
const ModLog = require('../../db/models/modlog');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/unmute <user> [reason]',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a member’s timeout')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to unmute')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for unmuting')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need Moderate Members permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Unmuted manually';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ I do not have permission to unmute this member.', ephemeral: true });
    }

    if (!member.communicationDisabledUntil) {
      return interaction.reply({ content: '❌ This user is not currently muted.', ephemeral: true });
    }

    try {
      await member.timeout(null); // Remove timeout
      await interaction.reply(`🔊 ${target.tag} has been unmuted.`);

      // DM the user
      try {
        await target.send(`🔊 You have been unmuted in **${interaction.guild.name}**.`);
      } catch (e) {
        console.log(`Could not DM ${target.tag}`);
      }

      await ModLog.create({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'unmute',
        reason,
        moderator: interaction.user.tag
      });

      logToChannel(interaction.guild, interaction.client, `🔊 ${target.tag} was unmuted by ${interaction.user.tag}. Reason: ${reason}`);
    } catch (err) {
      console.error('❌ Unmute failed:', err);
      await interaction.reply({ content: '❌ Failed to unmute member.', ephemeral: true });
    }
  }
};
