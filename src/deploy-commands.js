const config = require('./config');
const { deploySlashCommands } = require('./utils/deployCommands');

async function deployCommands() {
  const result = await deploySlashCommands(config);
  const names = result.registeredCommands.map((command) => `/${command.name}`).join(', ');

  console.log(`${result.registeredCommands.length} commande(s) slash enregistrée(s) (${result.scope}).`);
  console.log(`Commandes visibles côté Discord: ${names || 'aucune'}`);
}

deployCommands().catch((error) => {
  console.error("Impossible d'enregistrer les commandes slash:", error);

  if (error.code === 10002) {
    console.error('Discord dit "Unknown Application": vérifie que CLIENT_ID est bien l’Application ID du même bot que DISCORD_TOKEN.');
  }

  process.exit(1);
});
