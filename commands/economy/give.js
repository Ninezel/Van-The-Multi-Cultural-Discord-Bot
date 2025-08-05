const { SlashCommandBuilder } = require('discord.js');
const User = require('../../db/models/user');

module.exports = {
  category: 'Economy',
  adminOnly: false,
  usage: '/give <user> <amount>',
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give credits to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give credits to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of credits to transfer')
        .setMinValue(1)
        .setRequired(true)),

  async execute(interaction) {
    const giverId = interaction.user.id;
    const receiver = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (receiver.id === giverId) {
      return interaction.reply({ content: '❌ You cannot give credits to yourself.', ephemeral: true });
    }

    const giver = await User.findOne({ userId: giverId }) ?? await User.create({ userId: giverId });
    const receiverData = await User.findOne({ userId: receiver.id }) ?? await User.create({ userId: receiver.id });

    if (giver.credits < amount) {
      return interaction.reply({
        content: `❌ You don’t have enough credits. You only have **${giver.credits}**.`,
        ephemeral: true
      });
    }

    giver.credits -= amount;
    receiverData.credits += amount;

    await giver.save();
    await receiverData.save();

    await interaction.reply(
      `✅ You gave **${amount}** credits to **${receiver.username}**.\n` +
      `Your new balance: **${giver.credits}** | ${receiver.username} now has **${receiverData.credits}** credits.`
    );
  }
};
