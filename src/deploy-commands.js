const { REST, Routes } = require('discord.js');
const config = require('./config');
const { loadCommandData } = require('./utils/loadCommands');

async function deployCommands() {
  if (!config.clientId) {
    throw new Error('Variable d\'environnement manquante: CLIENT_ID');
  }

  const commands = loadCommandData();
  const rest = new REST({ version: '10' }).setToken(config.token);

  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  await rest.put(route, { body: commands });

  const scope = config.guildId ? `serveur ${config.guildId}` : 'global';
  console.log(`${commands.length} commande(s) slash enregistrée(s) (${scope}).`);
}

deployCommands().catch((error) => {
  console.error("Impossible d'enregistrer les commandes slash:", error);
  process.exit(1);
});
