const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/dog',
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random dog picture'),

  async execute(interaction) {
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();

      if (data.status !== 'success' || !data.message) {
        throw new Error('No dog image returned');
      }

      await interaction.reply({ content: `🐶 Here's a cute dog for you!\n${data.message}`, flags: 64 });
    } catch (err) {
      console.error('❌ Failed to fetch dog image:', err);
      await interaction.reply({ content: '❌ Could not fetch a dog image right now.', flags: 64 });
    }
  }
};
