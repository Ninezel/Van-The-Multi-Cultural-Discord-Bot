const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/joke [category]',
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('Optional joke category')
        .addChoices(
          { name: 'Programming', value: 'Programming' },
          { name: 'Pun', value: 'Pun' },
          { name: 'Dark', value: 'Dark' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category');
    const url = category
      ? `https://v2.jokeapi.dev/joke/${category}?type=single`
      : `https://v2.jokeapi.dev/joke/Any?type=single`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error || !data.joke) {
        return interaction.reply({ content: '❌ Failed to fetch a joke.', flags: 64 });
      }

      await interaction.reply({ content: `😂 ${data.joke}`, flags: 64 });
    } catch (err) {
      console.error('Joke fetch failed:', err);
      await interaction.reply({ content: '❌ Failed to fetch a joke.', flags: 64 });
    }
  }
};
