const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/lock',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the channel (deny @everyone from sending messages)'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ You need Manage Channels permission.', ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply('🔒 Channel locked.');
  }
};