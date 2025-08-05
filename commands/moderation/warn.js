const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ModLog = require('../../db/models/modlog');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/warn <user> <reason>',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for warning').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: '❌ You need Kick Members permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    await ModLog.create({
      userId: target.id,
      guildId: interaction.guild.id,
      action: 'warn',
      reason,
      moderator: interaction.user.tag
    });

    await interaction.reply(`⚠️ Warned ${target.username} for: ${reason}`);
    logToChannel(interaction.guild, interaction.client, `⚠️ ${interaction.user.tag} warned ${target.tag}: ${reason}`);

    // DM the user
    try {
      await target.send(`⚠️ You were warned in **${interaction.guild.name}** for: ${reason}`);
    } catch {
      console.log(`Could not DM ${target.tag}`);
    }

    // Auto-mute logic (after 3 warnings)
    const warningCount = await ModLog.countDocuments({
      userId: target.id,
      guildId: interaction.guild.id,
      action: 'warn'
    });

    if (warningCount >= 3) {
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      if (member && member.moderatable) {
        try {
          await member.timeout(60 * 60 * 1000, 'Auto-muted after 3 warnings'); // 1 hour
          await interaction.followUp({
            content: `🔇 ${target.tag} has been automatically muted for 1 hour (3+ warnings).`
          });

          logToChannel(interaction.guild, interaction.client, `🔇 ${target.tag} was auto-muted for 1 hour due to reaching 3 warnings.`);

          try {
            await target.send(`🔇 You have been muted in **${interaction.guild.name}** for 1 hour after receiving 3 warnings.`);
          } catch {
            console.log(`Could not DM ${target.tag} about auto-mute`);
          }

        } catch (err) {
          await interaction.followUp({
            content: `⚠️ Tried to auto-mute ${target.tag}, but failed. Missing permissions or role hierarchy.`,
            ephemeral: true
          });
          console.error(`❌ Failed to auto-mute ${target.tag}:`, err);
        }
      } else {
        await interaction.followUp({
          content: `⚠️ ${target.tag} has 3+ warnings but could not be muted (not moderatable).`,
          ephemeral: true
        });
      }
    }
  }
};
