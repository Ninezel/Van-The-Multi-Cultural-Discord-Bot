const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logToChannel } = require('../../utils/logger');
const ModLog = require('../../db/models/modlog');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/mute <user> <duration> [reason]',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member for a set duration')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to mute')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('duration')
        .setDescription('Use format like 10s, 5m, 2h, or 1d')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for mute')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need Moderate Members permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const rawDuration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member || !member.moderatable || !member.communicationDisabledUntilTimestamp) {
      return interaction.reply({
        content: '❌ I cannot mute this member (missing permissions or role hierarchy).',
        ephemeral: true
      });
    }

    const durationRegex = /^(\d+)([smhd])$/;
    const match = rawDuration.match(durationRegex);
    if (!match) {
      return interaction.reply({
        content: '❌ Invalid duration format. Use formats like `10s`, `5m`, `2h`, `1d`.',
        ephemeral: true
      });
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    const durationMs = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000
    }[unit] * amount;

    const readable = {
      s: 'second(s)',
      m: 'minute(s)',
      h: 'hour(s)',
      d: 'day(s)'
    }[unit];

    try {
      await member.timeout(durationMs, reason);
      await interaction.reply(`🔇 ${target.tag} has been muted for **${amount} ${readable}**.`);

      await ModLog.create({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'mute',
        reason,
        moderator: interaction.user.tag
      });

      logToChannel(interaction.guild, interaction.client, `🔇 ${target.tag} was muted by ${interaction.user.tag} for ${amount} ${readable}. Reason: ${reason}`);
    } catch (err) {
      console.error('Mute failed:', err);
      await interaction.reply({ content: '❌ Failed to mute member.', ephemeral: true });
    }
  }
};
