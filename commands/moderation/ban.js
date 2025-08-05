const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ModLog = require('../../db/models/modlog');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/ban <user> [reason]',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ You need the **Ban Members** permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot ban yourself.', ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ You cannot ban the bot.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '❌ That user is not in the server.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this member. Check their role hierarchy.', ephemeral: true });
    }

    try {
      await target.send(`🔨 You have been **banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}`).catch(() => {});
      await member.ban({ reason });

      await ModLog.create({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'ban',
        reason,
        moderator: interaction.user.tag
      });

      logToChannel(interaction.guild, interaction.client, `🔨 ${target.tag} was banned by ${interaction.user.tag}. Reason: ${reason}`);
      await interaction.reply(`✅ Successfully banned **${target.tag}**.\n📝 Reason: ${reason}`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Failed to ban the user. Please check my permissions.', ephemeral: true });
    }
  }
};
