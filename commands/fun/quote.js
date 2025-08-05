const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/quote',
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a motivational or thoughtful quote'),

  async execute(interaction) {
    try {
      const res = await fetch('https://zenquotes.io/api/random');
      const data = await res.json();

      if (!data || !data[0]) {
        throw new Error('Empty quote response');
      }

      const quote = data[0].q;
      const author = data[0].a;

      await interaction.reply({ content: `🧠 *"${quote}"*\n— **${author}**`, flags: 64 });
    } catch (err) {
      console.error('❌ Failed to fetch quote:', err);
      await interaction.reply({ content: '❌ Could not fetch a quote at the moment.', flags: 64 });
    }
  }
};
