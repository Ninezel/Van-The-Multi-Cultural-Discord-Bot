const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/unlock',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the channel (allow @everyone to send messages)'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ You need Manage Channels permission.', ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    await interaction.reply('🔓 Channel unlocked.');
  }
};