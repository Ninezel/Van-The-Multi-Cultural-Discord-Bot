const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Level = require('../../db/models/level');

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/level',
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your current level and XP'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const userData = await Level.findOne({ userId, guildId });

    if (!userData) {
      return interaction.reply({
        content: '🔍 No level data found. Start chatting to gain XP!',
        flags: MessageFlags.Ephemeral
      });
    }

    const nextLevelXP = userData.level * 100;

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`${interaction.user.username}'s Level`)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: 'Level', value: `${userData.level}`, inline: true },
        { name: 'XP', value: `${userData.xp} / ${nextLevelXP}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
