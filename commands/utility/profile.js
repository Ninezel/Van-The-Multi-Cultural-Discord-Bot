const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Level = require('../../db/models/level');
const User = require('../../db/models/user');
const createLevelCard = require('../../utils/createLevelCard');

function createProgressBar(current, max, size = 20) {
  const progress = Math.min(current / max, 1);
  const filledLength = Math.round(size * progress);
  const bar = '█'.repeat(filledLength) + '░'.repeat(size - filledLength);
  return bar;
}

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/profile [user]',
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show user profile info')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to view')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const userId = user.id;

    // Fetch level data or default
    const levelData = await Level.findOne({ userId, guildId }) || { level: 1, xp: 0, selectedBackground: 'default' };
    // Fetch user economic data or default
    const userData = await User.findOne({ userId }) || { credits: 0 };

    // Calculate XP progress bar
    const nextLevelXP = levelData.level * 100;
    const xpBar = createProgressBar(levelData.xp, nextLevelXP);

    // Fetch rank in the guild leaderboard
    const topUsers = await Level.find({ guildId }).sort({ level: -1, xp: -1 });
    const rank = topUsers.findIndex(u => u.userId === userId) + 1 || 'N/A';

    // Achievements placeholder
    const achievements = ['🏆 First message', '🎯 100 XP', '💰 Richer than 100 credits'];

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x1D82B6)
      .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setTitle('User Profile')
      .setDescription(`**Background:** ${levelData.selectedBackground || 'default'}`)
      .addFields(
        { name: '💰 Credits', value: `${userData.credits}`, inline: true },
        { name: '📊 Level', value: `${levelData.level}`, inline: true },
        { name: '📈 XP', value: `${levelData.xp} / ${nextLevelXP}`, inline: true },
        { name: 'Progress', value: xpBar, inline: false },
        { name: '🏅 Rank', value: rank.toString(), inline: true },
        { name: 'Achievements', value: achievements.join('\n'), inline: false }
      )
      .setTimestamp();

    // Generate profile card image
    const cardBuffer = await createLevelCard(user, levelData);
    const cardAttachment = new AttachmentBuilder(cardBuffer, { name: 'profile-card.png' });

    // Reply with embed and image attachment
    await interaction.reply({
      embeds: [embed],
      files: [cardAttachment],
      flags: MessageFlags.Ephemeral
    });
  }
};
