const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ModLog = require('../../db/models/modlog');

module.exports = {
  category: 'Moderation',
  adminOnly: true,
  usage: '/removewarn <user>',
  data: new SlashCommandBuilder()
    .setName('removewarn')
    .setDescription('Remove the most recent warning from a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to remove warning from')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need **Moderate Members** permission.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');

    const latestWarn = await ModLog.findOne({
      userId: user.id,
      guildId: interaction.guild.id,
      action: 'warn'
    }).sort({ timestamp: -1 });

    if (!latestWarn) {
      return interaction.reply({ content: `✅ ${user.tag} has no warnings to remove.`, ephemeral: true });
    }

    await latestWarn.deleteOne();

    await interaction.reply({ content: `⚠️ Removed the **latest warning** for ${user.tag}.`, ephemeral: true });
  }
};
