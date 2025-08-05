const { SlashCommandBuilder } = require('discord.js');
const User = require('../../db/models/user');

const symbols = ['🍒', '🍋', '🍇', '💎', '🍀', '🎰'];

module.exports = {
  category: 'Economy',
  adminOnly: false,
  usage: '/slot <bet>',
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Try your luck in the slot machine!')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('How much to bet')
        .setMinValue(1)
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');

    let user = await User.findOne({ userId }) || await User.create({ userId });

    if (user.credits < bet) {
      return interaction.reply({ content: `❌ You only have ${user.credits} credits.`, ephemeral: true });
    }

    const finalRoll = [
      pickWeightedSymbol(),
      pickWeightedSymbol(),
      pickWeightedSymbol()
    ];

    let payout = 0;
    let resultText = '';
    const allSame = finalRoll[0] === finalRoll[1] && finalRoll[1] === finalRoll[2];

    if (allSame && finalRoll[0] === '🎰') {
      payout = bet * 10;
      resultText = `🎰 **JACKPOT!!** 🎉 You won **${payout}** credits!\n✨💥🎇💥✨`;
    } else if (allSame) {
      payout = bet * 3;
      resultText = `🎉 You won **${payout}** credits!`;
    } else {
      resultText = `😢 You lost **${bet}** credits.`;
    }

    const spinFrames = 10;
    const delay = 200;

    let message = await interaction.reply({
      content: '🎰 **Spinning...** 🎶\n```[ - | - | - ]```',
      withResponse: true
    });

    for (let i = 0; i < spinFrames; i++) {
      const spinning = [symbols.random(), symbols.random(), symbols.random()];
      const frame = `🎰 **Spinning...** 🎵\n\`\`\`[ ${spinning.join(' | ')} ]\`\`\``;
      await new Promise(res => setTimeout(res, delay));
      await interaction.editReply({ content: frame }).catch(() => {});
    }

    // Final update of credits after animation
    user.credits += payout - bet;
    await user.save();

    const final = `🎰 **Final Result**\n\`\`\`[ ${finalRoll.join(' | ')} ]\`\`\`\n${resultText}\n💰 Balance: ${user.credits}`;
    await interaction.editReply({ content: final });
  }
};

// Weighted random: 🎰 is rare
function pickWeightedSymbol() {
  const pool = [
    '🍒', '🍒', '🍒',
    '🍋', '🍋', '🍋',
    '🍇', '🍇', '🍇',
    '💎', '💎',
    '🍀', '🍀',
    '🎰' // Rare
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Utility
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
