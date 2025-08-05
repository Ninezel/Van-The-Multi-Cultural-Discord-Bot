require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const Blacklist = require('./db/models/blacklist');

// Initialise client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// ✅ Load all slash commands recursively
const commandsPath = path.join(__dirname, 'commands');

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
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`⚠️ Command at ${fullPath} is missing "data" or "execute".`);
      }
    }
  }
};

walkCommands(commandsPath);

// ✅ Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ✅ Handle slash command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🔒 Check if user is blacklisted
  try {
    const isBlacklisted = await Blacklist.findOne({ userId: interaction.user.id });
    if (isBlacklisted) {
      return interaction.reply({
        content: `❌ You are blacklisted from using this bot.\n**Reason:** ${isBlacklisted.reason}`,
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (err) {
    console.error('❌ Failed to check blacklist:', err);
    return interaction.reply({ content: '⚠️ Internal error while checking blacklist.', ephemeral: true });
  }

  // ✅ Run slash command
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error in command "${interaction.commandName}":`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  }
});

// ✅ Log in
client.login(process.env.DISCORD_TOKEN);
