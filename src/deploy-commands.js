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
  process.exit(1);
});
