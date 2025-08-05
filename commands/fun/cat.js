const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/cat',
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Get a random cute cat picture'),

  async execute(interaction) {
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();

      if (!data || !data[0]?.url) {
        throw new Error('No cat image returned');
      }

      await interaction.reply({ content: `🐱 Here's a cute cat for you!\n${data[0].url}`, flags: 64 });
    } catch (err) {
      console.error('❌ Failed to fetch cat image:', err);
      await interaction.reply({ content: '❌ Could not fetch a cat image right now.', flags: 64 });
    }
  }
};
