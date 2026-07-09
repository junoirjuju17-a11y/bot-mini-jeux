const { Client, Collection, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const config = require('./config');
const { GameManager } = require('./games/GameManager');
const { loadCommands } = require('./utils/loadCommands');
const { deploySlashCommands } = require('./utils/deployCommands');
const { handleInteractionError } = require('./utils/errors');
const { handleTextCommand } = require('./textCommands');

process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée non gérée:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

const intents = [GatewayIntentBits.Guilds];

if (config.enableMessageContentIntent) {
  intents.push(GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent);
}

const client = new Client({ intents });

client.commands = new Collection();
client.games = new GameManager();

const loadedCommands = loadCommands();

for (const command of loadedCommands) {
  client.commands.set(command.data.name, command);
}

console.log(`Commandes slash chargées localement: ${loadedCommands.map((command) => `/${command.data.name}`).join(', ') || 'aucune'}`);
console.log(`Commandes texte: ${config.enableMessageContentIntent ? `actives avec le préfixe ${config.prefix}` : 'désactivées'}`);
console.log(`Intents demandés: ${intents.join(', ')}`);

client.once('clientReady', async (readyClient) => {
  console.log(`Connecté en tant que ${readyClient.user.tag}.`);

  const runtimeClientId = getRuntimeClientId(readyClient);
  const runtimeGuildId = getRuntimeGuildId(readyClient);

  logConfigurationHelp(runtimeClientId, runtimeGuildId, readyClient);

  if (config.registerCommandsOnStart) {
    await registerCommandsOnStart(runtimeClientId, runtimeGuildId);
  } else {
    console.log('Enregistrement automatique des commandes slash désactivé. Lance `npm run deploy:commands` manuellement.');
  }

  if (!config.enableMessageContentIntent) {
    console.log('Commandes texte désactivées: active ENABLE_MESSAGE_CONTENT_INTENT=true après avoir activé Message Content Intent dans Discord.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`Commande slash inconnue reçue: /${interaction.commandName}`);
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

if (config.enableMessageContentIntent) {
  client.on('messageCreate', async (message) => {
    await handleTextCommand(message, {
      client,
      gameManager: client.games,
      prefix: config.prefix,
    });
  });
}

client.on('error', (error) => {
  console.error('Erreur client Discord:', error);
});

client.login(config.token).catch((error) => {
  console.error('Impossible de connecter le bot Discord:', error);
  process.exit(1);
});

async function registerCommandsOnStart(runtimeClientId, runtimeGuildId) {
  if (!runtimeClientId) {
    console.warn('ID application introuvable: les commandes slash ne peuvent pas être enregistrées automatiquement.');
    return;
  }

  try {
    const result = await deploySlashCommands({
      ...config,
      clientId: runtimeClientId,
      guildId: runtimeGuildId,
    });
    const names = result.registeredCommands.map((command) => `/${command.name}`).join(', ');

    console.log(`${result.registeredCommands.length} commande(s) slash enregistrée(s) (${result.scope}).`);
    console.log(`Commandes slash visibles côté Discord: ${names || 'aucune'}`);
  } catch (error) {
    console.error("Échec de l'enregistrement automatique des commandes slash:", error);

    if (error.code === 10002) {
      console.error('Discord dit "Unknown Application": le CLIENT_ID du .env ne correspond probablement pas au token. Au démarrage, le bot utilise maintenant son ID réel, donc vérifie surtout que tu as redéployé cette version.');
    }
  }
}

function logConfigurationHelp(runtimeClientId, runtimeGuildId, readyClient) {
  console.log(`CLIENT_ID .env: ${config.clientId || 'absent'}`);
  console.log(`CLIENT_ID réel du bot connecté: ${runtimeClientId}`);

  if (config.clientId && runtimeClientId && config.clientId !== runtimeClientId) {
    console.warn('Attention: CLIENT_ID dans .env ne correspond pas au bot connecté. Utilise le CLIENT_ID réel affiché ci-dessus.');
  }

  console.log(`Serveurs où le bot est présent: ${readyClient.guilds.cache.size}`);
  console.log(`GUILD_ID utilisé pour les slash commands: ${runtimeGuildId || 'absent, déploiement global'}`);

  if (!config.guildId && runtimeGuildId) {
    console.log(`GUILD_ID absent dans .env: utilisation automatique du seul serveur détecté (${runtimeGuildId}).`);
  }

  if (!runtimeGuildId) {
    console.warn('Aucun GUILD_ID serveur utilisé: les commandes slash globales peuvent mettre du temps à apparaître. Ajoute GUILD_ID pour un affichage rapide.');
  }

  if (runtimeClientId) {
    console.log(`Lien d'invitation conseillé: ${buildInviteUrl(runtimeClientId)}`);
  }
}

function getRuntimeClientId(readyClient) {
  return readyClient.application?.id || readyClient.user?.id || config.clientId;
}

function getRuntimeGuildId(readyClient) {
  if (config.guildId) {
    return config.guildId;
  }

  if (readyClient.guilds.cache.size === 1) {
    return readyClient.guilds.cache.first().id;
  }

  return null;
}

function buildInviteUrl(clientId) {
  const permissions = new PermissionsBitField([
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ReadMessageHistory,
    PermissionsBitField.Flags.ManageMessages,
  ]);

  const params = new URLSearchParams({
    client_id: clientId,
    permissions: permissions.bitfield.toString(),
    scope: 'bot applications.commands',
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
