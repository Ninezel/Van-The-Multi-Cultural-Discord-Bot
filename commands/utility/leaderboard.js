const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../../db/models/level');

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/leaderboard',
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top users by level'),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    // Fetch top 10 users sorted by level desc, then xp desc
    const topUsers = await Level.find({ guildId })
      .sort({ level: -1, xp: -1 })
      .limit(10);

    if (!topUsers.length) {
      return interaction.reply({
        content: 'No leveling data found for this server.',
        ephemeral: true
      });
    }

    // Build leaderboard entries
    const leaderboardEntries = await Promise.all(topUsers.map(async (userData, index) => {
      let username = `User#${userData.userId}`;
      try {
        const member = await interaction.guild.members.fetch(userData.userId);
        username = member.user.username;
      } catch {
        // fallback username kept
      }
      return `**#${index + 1}** • **${username}** — Level ${userData.level} (${userData.xp} XP)`;
    }));

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle(`🏆 Level Leaderboard for ${interaction.guild.name}`)
      .setDescription(leaderboardEntries.join('\n'))
      .setColor(0xFFD700)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
