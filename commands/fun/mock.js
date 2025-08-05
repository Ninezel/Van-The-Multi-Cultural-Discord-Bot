const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/mock <text>',
  data: new SlashCommandBuilder()
    .setName('mock')
    .setDescription('Repeats your message in mocking SpongeBob case')
    .addStringOption(opt =>
      opt.setName('text')
        .setDescription('Text to mock')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('text');

    const mocked = input
      .split('')
      .map(char =>
        Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');

    await interaction.reply({
      content: `🗿 ${mocked}`,
      flags: MessageFlags.Ephemeral
    });
  }
};
