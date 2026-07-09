require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

module.exports = {
  token: requireEnv('DISCORD_TOKEN'),
  clientId: process.env.CLIENT_ID || null,
  guildId: process.env.GUILD_ID || null,
  prefix: process.env.PREFIX || '!',
};
