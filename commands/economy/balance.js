const { SlashCommandBuilder } = require('discord.js');
const User = require('../../db/models/user');

module.exports = {
  category: 'Economy',
  adminOnly: false,
  usage: '/balance',
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your credit balance'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = await User.findOne({ userId }) ?? await User.create({ userId });

    await interaction.reply(`💰 **${interaction.user.username}**, you have **${user.credits}** credits.`);
  },
};
