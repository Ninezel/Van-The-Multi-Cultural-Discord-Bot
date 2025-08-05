const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/roast <user>',
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Send a roast to someone')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to roast')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');

    try {
      const res = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
      const data = await res.json();

      await interaction.reply({
        content: `🔥 <@${target.id}>, ${data.insult}`,
        flags: 64
      });
    } catch (err) {
      console.error('Roast fetch failed:', err);
      await interaction.reply({ content: '❌ Could not fetch a roast at the moment.', flags: 64 });
    }
  }
};
