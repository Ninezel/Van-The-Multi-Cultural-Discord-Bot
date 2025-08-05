const { SlashCommandBuilder } = require('discord.js');
const User = require('../../db/models/user');

module.exports = {
  category: 'Economy',
  adminOnly: false,
  usage: '/daily',
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect your daily credits!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();

    let user = await User.findOne({ userId }) ?? await User.create({ userId });

    if (user.lastDaily) {
      const diff = now - new Date(user.lastDaily);
      if (diff < 86400000) {
        const hours = Math.floor((86400000 - diff) / (1000 * 60 * 60));
        const minutes = Math.floor((86400000 - diff) / (1000 * 60)) % 60;
        return interaction.reply(`🕒 You’ve already collected your daily. Try again in **${hours}h ${minutes}m**.`);
      }
    }

    user.credits += 200;
    user.lastDaily = now;
    await user.save();

    await interaction.reply(`✅ ${interaction.user.username}, you’ve claimed your daily **200** credits! 💰`);
  },
};
