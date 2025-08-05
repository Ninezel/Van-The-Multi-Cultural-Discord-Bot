const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/wanted [user]',
  data: new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Create a WANTED poster for a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to make wanted')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 }).split('?')[0];

    try {
      const apiUrl = `https://api.popcat.xyz/wanted?image=${encodeURIComponent(avatarURL)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image')) {
        const errorText = await response.text();
        console.error('API did not return an image:', errorText);
        throw new Error('API did not return an image');
      }

      const buffer = await response.buffer();
      const attachment = new AttachmentBuilder(buffer, { name: 'wanted.png' });

      await interaction.reply({ files: [attachment], flags: 64 });
    } catch (err) {
      console.error('❌ Failed to generate wanted image:', err);
      await interaction.reply({ content: '❌ Could not generate a WANTED poster.', flags: 64 });
    }
  }
};
