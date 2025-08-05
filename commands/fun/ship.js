const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/ship <user1> <user2> [private]',
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship two users together')
    .addUserOption(opt =>
      opt.setName('user1').setDescription('First person').setRequired(true))
    .addUserOption(opt =>
      opt.setName('user2').setDescription('Second person').setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('private').setDescription('Show result only to you (true/false)')),

  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const isPrivate = interaction.options.getBoolean('private') ?? false;

    if (user1.id === user2.id) {
      return interaction.reply({ content: '❌ You can’t ship someone with themselves!', ephemeral: true });
    }

    const shipName =
      user1.username.slice(0, Math.ceil(user1.username.length / 2)) +
      user2.username.slice(Math.floor(user2.username.length / 2));

    const score = Math.floor(Math.random() * 101);
    let message = '';

    if (score > 90) message = '💖 A match made in heaven!';
    else if (score > 70) message = '💕 So much chemistry!';
    else if (score > 50) message = '💞 Could work out!';
    else if (score > 30) message = '💔 A rocky road ahead...';
    else message = '🚫 Not meant to be. Try again next life!';

    const embed = new EmbedBuilder()
      .setTitle('💘 Shipping Results')
      .addFields(
        { name: 'Ship Name', value: shipName, inline: true },
        { name: 'Compatibility', value: `${score}% ❤️`, inline: true },
        { name: 'Verdict', value: message }
      )
      .setColor('Random')
      .setThumbnail(user1.displayAvatarURL({ dynamic: true }))
      .setImage(user2.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${user1.username} 💞 ${user2.username}` });

    await interaction.reply({ embeds: [embed], ephemeral: isPrivate });
  }
};
