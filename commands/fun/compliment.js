const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/compliment [user]',
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Send a sweet compliment')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to compliment')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    try {
      const res = await fetch('https://complimentr.com/api');
      const data = await res.json();
      const compliment = data.compliment;

      const message = user
        ? `💖 <@${user.id}>, ${compliment}`
        : `💖 ${compliment}`;

      await interaction.reply({ content: message, flags: 64 });
    } catch (err) {
      console.error('❌ Failed to fetch compliment:', err);
      await interaction.reply({ content: '❌ Could not fetch a compliment right now.', flags: 64 });
    }
  }
};
