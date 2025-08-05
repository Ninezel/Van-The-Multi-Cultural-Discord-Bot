const { MessageFlags } = require('discord.js');
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  PermissionsBitField
} = require('discord.js');

module.exports = {
  category: 'Utility',
  adminOnly: false,
  usage: '/commands',
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('View all bot commands in a menu'),

  async execute(interaction) {
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers);
    const commandList = interaction.client.commands;

    // Group commands by category
    const grouped = {};
    for (const [, cmd] of commandList) {
      const category = cmd.category || 'Other';
      if (cmd.adminOnly && !isAdmin) continue;

      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(cmd);
    }

    const categories = Object.keys(grouped).sort();

    // Build embeds per category
    const embeds = categories.map((cat, i) => {
      const embed = new EmbedBuilder()
        .setTitle(`📖 ${cat} Commands`)
        .setColor(0x5865F2)
        .setFooter({ text: `Page ${i + 1} of ${categories.length}` });

      const lines = grouped[cat]
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
        .map(cmd => {
          const usage = cmd.usage || `/${cmd.data.name}`;
          return `\`${usage}\` — ${cmd.data.description}`;
        });

      embed.setDescription(lines.join('\n') || '*No commands found*');
      return embed;
    });

    let currentPage = 0;

    const buildButtons = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️ Previous')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ▶️')
          .setStyle(ButtonStyle.Secondary)
      );

    const buildDropdown = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('category_select')
          .setPlaceholder('Jump to a category')
          .addOptions(
            categories.map((cat, i) => ({
              label: cat,
              value: i.toString(),
              description: `View ${cat} commands`
            }))
          )
      );

    await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [buildButtons(), buildDropdown()],
      flags: MessageFlags.Ephemeral
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000
    });

    const selectCollector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ Not your menu.', ephemeral: true });

      if (i.customId === 'next') {
        currentPage = (currentPage + 1) % embeds.length;
      } else if (i.customId === 'prev') {
        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
      }

      await i.update({
        embeds: [embeds[currentPage]],
        components: [buildButtons(), buildDropdown()]
      });
    });

    selectCollector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ Not your menu.', ephemeral: true });

      currentPage = parseInt(i.values[0]);
      await i.update({
        embeds: [embeds[currentPage]],
        components: [buildButtons(), buildDropdown()]
      });
    });

    collector.on('end', () => {
      message.edit({ components: [] }).catch(() => null);
    });
  }
};
