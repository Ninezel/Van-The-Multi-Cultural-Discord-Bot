const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/owoify <text>',
  data: new SlashCommandBuilder()
    .setName('owoify')
    .setDescription('Turn your message into owo-speak')
    .addStringOption(opt =>
      opt.setName('text')
        .setDescription('Text to owoify')
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');

    const owoified = text
      .replace(/(?:r|l)/g, 'w')
      .replace(/(?:R|L)/g, 'W')
      .replace(/n([aeiou])/gi, 'ny$1')
      .replace(/N([aeiou])/g, 'Ny$1')
      .replace(/ove/g, 'uv')
      .replace(/!+/g, ' owo!')
      + ' ~uwu';

    await interaction.reply({
      content: `🐾 ${owoified}`,
      flags: MessageFlags.Ephemeral
    });
  }
};
