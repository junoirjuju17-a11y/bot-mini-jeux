const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { GameManager } = require('./games/GameManager');
const { loadCommands } = require('./utils/loadCommands');
const { handleInteractionError } = require('./utils/errors');
const { handleTextCommand } = require('./textCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.games = new GameManager();

for (const command of loadCommands()) {
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}.`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction, {
      client,
      gameManager: client.games,
    });
  } catch (error) {
    await handleInteractionError(interaction, error);
  }
});

client.on('messageCreate', async (message) => {
  await handleTextCommand(message, {
    client,
    gameManager: client.games,
    prefix: config.prefix,
  });
});

client.login(config.token);
