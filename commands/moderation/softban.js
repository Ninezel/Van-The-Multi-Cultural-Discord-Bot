const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logToChannel } = require('../../utils/logger');
const ModLog = require('../../db/models/modlog');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/softban <user> [reason]',
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban then unban a user to delete their messages')
    .addUserOption(opt => opt.setName('user').setDescription('User to softban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ You need Ban Members permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.bot) {
      return interaction.reply({ content: '❌ You cannot softban a bot.', ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot softban yourself.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member || !member.bannable) {
      return interaction.reply({ content: '❌ Cannot softban this user.', ephemeral: true });
    }

    try {
      // Try DM
      try {
        await target.send(`⚠️ You were softbanned from **${interaction.guild.name}**.\nReason: ${reason}`);
      } catch (e) {
        console.log(`Could not DM ${target.tag}.`);
      }

      await member.ban({ reason, deleteMessageDays: 7 });
      await interaction.guild.members.unban(target.id);

      await ModLog.create({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'softban',
        reason,
        moderator: interaction.user.tag
      });

      logToChannel(interaction.guild, interaction.client, `💥 ${target.tag} was softbanned by ${interaction.user.tag}. Reason: ${reason}`);
      await interaction.reply(`💥 ${target.tag} has been softbanned (messages cleared).`);
    } catch (err) {
      console.error('❌ Softban failed:', err);
      await interaction.reply({ content: '❌ Failed to softban user.', ephemeral: true });
    }
  }
};
