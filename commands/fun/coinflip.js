const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/coinflip',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin!'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails';
    await interaction.reply(result);
  }
};