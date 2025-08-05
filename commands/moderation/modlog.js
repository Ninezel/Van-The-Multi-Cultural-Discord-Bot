const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ModLog = require('../../db/models/modlog');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/modlog <user>',
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('View a user’s moderation history')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Target user')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need Moderate Members permission.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');

    try {
      const logs = await ModLog.find({
        userId: target.id,
        guildId: interaction.guild.id
      }).sort({ timestamp: -1 });

      if (logs.length === 0) {
        return interaction.reply({ content: `✅ No moderation history for **${target.tag}**.`, ephemeral: true });
      }

      const entries = logs.map(log =>
        `• **${log.action.toUpperCase()}** by ${log.moderator}\n   🕒 <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:f>\n   📄 ${log.reason}`
      );

      const chunks = chunkEntries(entries, 1800); // Keep under Discord's message limit

      for (const [i, chunk] of chunks.entries()) {
        await interaction.followUp({
          content: `${i === 0 ? `🧾 Modlog for **${target.tag}**:` : ''}\n\n${chunk}`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.error('Modlog Fetch Error:', err);
      await interaction.reply({ content: '❌ Failed to retrieve modlog.', ephemeral: true });
    }
  }
};

// Break long messages into safe chunks
function chunkEntries(entries, maxLen) {
  const chunks = [];
  let current = '';

  for (const entry of entries) {
    if ((current + '\n\n' + entry).length > maxLen) {
      chunks.push(current);
      current = entry;
    } else {
      current += (current ? '\n\n' : '') + entry;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
