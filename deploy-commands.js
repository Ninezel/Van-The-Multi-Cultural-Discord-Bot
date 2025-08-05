require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];

/**
 * Recursively walk through folders and collect commands
 */
const walkCommands = dir => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ Command at ${fullPath} is missing "data" or "execute".`);
      }
    }
  }
};

// Scan all commands
walkCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔁 Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
