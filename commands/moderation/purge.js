const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { logToChannel } = require('../../utils/logger');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/purge <amount> [user]',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete recent messages from the channel')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: '❌ You need **Manage Messages** permission.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let filtered = messages;

    if (targetUser) {
      filtered = messages.filter(msg => msg.author.id === targetUser.id);
    }

    const toDelete = filtered.first(amount);

    if (!toDelete || toDelete.length === 0) {
      return interaction.editReply('⚠️ No messages found to delete.');
    }

    try {
      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      await interaction.editReply(`🧹 Deleted **${deleted.size}** message(s) ${targetUser ? `from ${targetUser.tag}` : ''}.`);
      logToChannel(interaction.guild, interaction.client, `🧹 ${interaction.user.tag} purged ${deleted.size} message(s) in #${interaction.channel.name}`);
    } catch (err) {
      console.error('Purge failed:', err);
      await interaction.editReply('❌ Failed to delete messages. Discord only allows bulk deletion of messages under 14 days old.');
    }
  }
};
