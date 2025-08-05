const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const Blacklist = require('../db/models/blacklist');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    const player = useMainPlayer();

    // ✅ Handle buttons
    if (interaction.isButton()) {
      const queue = player.nodes.get(interaction.guildId);

      if (!queue || !queue.node.isPlaying()) {
        return interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
      }

      try {
        switch (interaction.customId) {
          case 'music_pause':
            if (queue.node.isPaused()) {
              queue.node.resume();
              await interaction.reply({ content: '▶️ Resumed playback.', ephemeral: true });
            } else {
              queue.node.pause();
              await interaction.reply({ content: '⏸️ Paused playback.', ephemeral: true });
            }
            break;

          case 'music_skip':
            await queue.node.skip();
            await interaction.reply({ content: '⏭️ Skipped to next track.', ephemeral: true });
            break;

          case 'music_stop':
            queue.delete();
            await interaction.reply({ content: '🛑 Stopped and disconnected.', ephemeral: true });
            break;

          case 'music_loop': {
            const modeNames = ['Off', 'Track', 'Queue'];
            const newMode = (queue.repeatMode + 1) % 3;
            queue.setRepeatMode(newMode);
            await interaction.reply({ content: `🔁 Loop mode set to: **${modeNames[newMode]}**`, ephemeral: true });
            break;
          }

          case 'music_back':
            if (queue.history?.previousTrack) {
              queue.node.play(queue.history.previousTrack);
              await interaction.reply({ content: '⏮️ Now playing the previous track.', ephemeral: true });
            } else {
              await interaction.reply({ content: '⚠️ No previous track found.', ephemeral: true });
            }
            break;

          default:
            await interaction.reply({ content: '⚠️ Unknown button action.', ephemeral: true });
        }
      } catch (err) {
        console.error('❌ Error in music button interaction:', err);
        await interaction.reply({ content: '❌ Something went wrong while processing the button.', ephemeral: true });
      }

      return;
    }

    // ✅ Handle slash commands
    if (interaction.isChatInputCommand()) {
      try {
        const isBlacklisted = await Blacklist.findOne({ userId: interaction.user.id });
        if (isBlacklisted) {
          return interaction.reply({
            content: `❌ You are blacklisted from using this bot.\n**Reason:** ${isBlacklisted.reason}`,
            ephemeral: true
          });
        }
      } catch (err) {
        console.error('❌ Failed to check blacklist:', err);
        return interaction.reply({ content: '⚠️ Internal error while checking blacklist.', ephemeral: true });
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`❌ Error in command "${interaction.commandName}":`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
      }
    }
  }
};
