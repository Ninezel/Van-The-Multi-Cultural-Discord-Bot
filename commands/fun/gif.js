const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/gif [search]',
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Search and send a GIF from Giphy')
    .addStringOption(opt =>
      opt.setName('search')
        .setDescription('Search term')
        .setRequired(false)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('search') || 'funny';
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=10&rating=pg`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return interaction.reply({ content: '❌ No GIFs found.', flags: 64 });
    }

    const gif = data.data[Math.floor(Math.random() * data.data.length)];
    await interaction.reply({ content: gif.url, flags: 64 });
  }
};
