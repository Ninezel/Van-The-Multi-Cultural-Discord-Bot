const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/avatar [user]',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(opt => 
      opt.setName('user').setDescription('User to view avatar').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    await interaction.reply({
      content: `${user.username}'s avatar:`,
      embeds: [{
        image: { url: avatarUrl },
        color: 0x3498db
      }]
    });
  }
};
