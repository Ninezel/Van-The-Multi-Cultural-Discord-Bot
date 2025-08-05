const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/dice',
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice (1-6)'),

  async execute(interaction) {
    const roll = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`🎲 You rolled a **${roll}**!`);
  }
};
