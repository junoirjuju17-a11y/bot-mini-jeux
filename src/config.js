require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

function readBooleanEnv(name, defaultValue = false) {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

module.exports = {
  token: requireEnv('DISCORD_TOKEN'),
  clientId: process.env.CLIENT_ID || null,
  guildId: process.env.GUILD_ID || null,
  prefix: process.env.PREFIX || '!',
  enableMessageContentIntent: readBooleanEnv('ENABLE_MESSAGE_CONTENT_INTENT', false),
};
