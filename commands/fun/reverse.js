const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/reverse <text>',
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverses your message')
    .addStringOption(opt =>
      opt.setName('text')
        .setDescription('Text to reverse')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('text');
    const reversed = input.split('').reverse().join('');

    await interaction.reply({
      content: `🔁 ${reversed}`,
      flags: MessageFlags.Ephemeral
    });
  }
};
