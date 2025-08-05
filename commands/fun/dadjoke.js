const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/dadjoke [search]',
  data: new SlashCommandBuilder()
    .setName('dadjoke')
    .setDescription('Get a random dad joke or search for one')
    .addStringOption(opt =>
      opt.setName('search')
        .setDescription('Keyword to search dad jokes for')
        .setRequired(false)
    ),

  async execute(interaction) {
    const search = interaction.options.getString('search');
    const baseUrl = 'https://icanhazdadjoke.com/';
    const url = search
      ? `${baseUrl}search?term=${encodeURIComponent(search)}`
      : baseUrl;

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      });

      const data = await response.json();

      if (search) {
        const jokes = data.results || [];
        if (!jokes.length) {
          return interaction.reply({ content: `❌ No dad jokes found for **${search}**.`, flags: 64 });
        }

        const random = jokes[Math.floor(Math.random() * jokes.length)];
        return interaction.reply({ content: `🔍 **Search: ${search}**\n👨‍🦳 ${random.joke}`, flags: 64 });
      }

      if (!data || !data.joke) {
        return interaction.reply({ content: '❌ Failed to fetch a dad joke.', flags: 64 });
      }

      await interaction.reply({ content: `👨‍🦳 ${data.joke}`, flags: 64 });
    } catch (err) {
      console.error('Dad joke fetch failed:', err);
      await interaction.reply({ content: '❌ Could not fetch a dad joke.', flags: 64 });
    }
  }
};
