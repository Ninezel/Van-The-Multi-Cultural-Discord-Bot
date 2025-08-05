const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Settings = require('../../db/models/settings');

module.exports = {
  category: 'Utility',
  adminOnly: true,
  usage: '/setlogchannel <channel>',
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set the log channel for admin/mod actions')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Select the log channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
    }

    const logChannel = interaction.options.getChannel('channel');

    try {
      await Settings.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { logChannelId: logChannel.id },
        { upsert: true }
      );

      await interaction.reply(`✅ Log channel successfully set to ${logChannel}.`);
    } catch (error) {
      console.error('❌ Error setting log channel:', error);
      await interaction.reply({ content: '⚠️ Failed to set log channel. Try again later.', ephemeral: true });
    }
  }
};
