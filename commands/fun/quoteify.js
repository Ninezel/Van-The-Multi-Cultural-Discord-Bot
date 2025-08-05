const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/quoteify',
  data: new SlashCommandBuilder()
    .setName('quoteify')
    .setDescription('Generate a quote image'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const url = 'https://zenquotes.io/api/image';
      const res = await fetch(url);
      const data = await res.buffer();

      if (!data || data.length === 0) {
        throw new Error('Empty image response');
      }

      const attachment = new AttachmentBuilder(data, { name: 'quote.png' });
      await interaction.editReply({ files: [attachment] });
    } catch (err) {
      console.error('Quoteify image failed:', err);
      await interaction.editReply({
        content: '❌ Could not generate quote image.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
