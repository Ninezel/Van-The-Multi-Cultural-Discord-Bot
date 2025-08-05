const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fetch = require('node-fetch');

const memeCategories = {
  wholesome: 'wholesomememes',
  dank: 'dankmemes',
  dark: 'darkhumor',
  classic: 'memes',
  cats: 'catmemes',
  programming: 'ProgrammerHumor'
};

module.exports = {
  category: 'Fun',
  adminOnly: false,
  usage: '/meme [category]',
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Fetch a meme from a selected category')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Choose meme category')
        .addChoices(
          { name: 'Wholesome', value: 'wholesome' },
          { name: 'Dank', value: 'dank' },
          { name: 'Dark Humour', value: 'dark' },
          { name: 'Classic', value: 'classic' },
          { name: 'Cats', value: 'cats' },
          { name: 'Programming', value: 'programming' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const categoryInput = interaction.options.getString('category') || 'classic';

    // Restrict dark humour to NSFW channels
    if (categoryInput === 'dark' && !interaction.channel.nsfw) {
      return interaction.reply({
        content: '⚠️ Dark humour memes can only be viewed in NSFW channels.',
        flags: MessageFlags.Ephemeral
      });
    }

    const subreddit = memeCategories[categoryInput];

    try {
      let res = await fetch(`https://meme-api.com/gimme/${subreddit}`);
      let data = await res.json();

      // Fallback if dark fails
      if (!data || !data.url) {
        if (categoryInput === 'dark') {
          res = await fetch(`https://meme-api.com/gimme/memes`);
          data = await res.json();
        }
      }

      if (!data || !data.url) {
        return interaction.reply({
          content: '⚠️ Failed to fetch meme. Please try again later.',
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(data.title || 'Here’s a meme for you!')
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups} | r/${data.subreddit}` });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error('Meme fetch failed:', err);
      return interaction.reply({
        content: '❌ Error while fetching meme.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
