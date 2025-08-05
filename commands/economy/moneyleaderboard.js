const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../db/models/user');

module.exports = {
  category: 'Economy',
  adminOnly: false,
  usage: '/moneyleaderboard',
  data: new SlashCommandBuilder()
    .setName('moneyleaderboard')
    .setDescription('Show top users by money'),

  async execute(interaction) {
    const topUsers = await User.find()
      .sort({ credits: -1 })
      .limit(10);

    if (!topUsers.length) {
      return interaction.reply({
        content: 'No economy data found.',
        ephemeral: true
      });
    }

    const leaderboardEntries = await Promise.all(topUsers.map(async (userData, index) => {
      let username = `User#${userData.userId}`;
      try {
        const member = await interaction.guild.members.fetch(userData.userId);
        username = member.user.username;
      } catch {
        // fallback username kept
      }
      return `**#${index + 1}** • **${username}** — 💰 ${userData.credits}`;
    }));

    const embed = new EmbedBuilder()
      .setTitle(`💰 Money Leaderboard for ${interaction.guild.name}`)
      .setDescription(leaderboardEntries.join('\n'))
      .setColor(0xFFD700)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
