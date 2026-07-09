const { REST, Routes } = require('discord.js');
const { loadCommandData } = require('./loadCommands');

async function deploySlashCommands({ token, clientId, guildId }) {
  if (!clientId) {
    throw new Error("CLIENT_ID manquant: impossible d'enregistrer les commandes slash.");
  }

  const commands = loadCommandData();
  const rest = new REST({ version: '10' }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  await rest.put(route, { body: commands });

  const registeredCommands = await rest.get(route);
  const scope = guildId ? `serveur ${guildId}` : 'global';

  return {
    scope,
    commands,
    registeredCommands,
  };
}

module.exports = {
  deploySlashCommands,
};
