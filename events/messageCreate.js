const { EmbedBuilder } = require('discord.js');
const Level = require('../db/models/level');

const xpCooldown = new Set();
const levelUpCooldown = new Set();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    // XP gain cooldown (1 min)
    if (xpCooldown.has(userId)) return;
    xpCooldown.add(userId);
    setTimeout(() => xpCooldown.delete(userId), 60 * 1000);

    // Random XP gain 5-15
    const xpGain = Math.floor(Math.random() * 11) + 5;

    let userData = await Level.findOne({ userId, guildId });
    if (!userData) {
      userData = await Level.create({ userId, guildId });
    }

    userData.xp += xpGain;
    const nextLevelXP = userData.level * 100;

    if (userData.xp >= nextLevelXP) {
      userData.level++;
      userData.xp -= nextLevelXP;

      // Level-up announcement cooldown (10 mins)
      if (!levelUpCooldown.has(userId)) {
        levelUpCooldown.add(userId);
        setTimeout(() => levelUpCooldown.delete(userId), 10 * 60 * 1000);

        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('Level Up! 🎉')
          .setDescription(`${message.author} has reached **Level ${userData.level}**!`)
          .setThumbnail(message.author.displayAvatarURL({ size: 128 }))
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }
    }

    await userData.save();
  }
};
