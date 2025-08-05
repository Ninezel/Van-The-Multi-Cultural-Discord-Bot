const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/userinfo [user]',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get user info')
    .addUserOption(opt => 
      opt.setName('user').setDescription('Target user').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = {
      title: `${user.username}'s Info`,
      fields: [
        { name: 'ID', value: user.id, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      ],
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) }
    };

    await interaction.reply({ embeds: [embed] });
  }
};
