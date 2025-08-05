const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/rps <choice>',
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors against the bot!')
    .addStringOption(opt =>
      opt.setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' }
        )
    ),

  async execute(interaction) {
    const userChoice = interaction.options.getString('choice');
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    if (userChoice === botChoice) {
      result = '🤝 It’s a draw!';
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = '🎉 You win!';
    } else {
      result = '😢 You lose!';
    }

    await interaction.reply({
      content: `🧠 You chose **${userChoice}**\n🤖 I chose **${botChoice}**\n\n${result}`,
      flags: MessageFlags.Ephemeral
    });
  }
};
