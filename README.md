# Discord Mini Games Bot

Bot Discord en Node.js avec Discord.js. Il fournit une base extensible pour ajouter des mini-jeux et inclut un premier jeu : Pierre-Feuille-Ciseaux.

## Prérequis

- Node.js 18.17 ou plus récent
- Un bot Discord créé dans le Discord Developer Portal
- Les intents standards `Guilds`

## 1. Créer le fichier `.env`

Copie `.env.example` vers `.env`, puis remplis les valeurs :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application_du_bot
GUILD_ID=id_du_serveur_de_test
```

- `DISCORD_TOKEN` : token du bot, à ne jamais publier.
- `CLIENT_ID` : identifiant de l'application Discord.
- `GUILD_ID` : identifiant du serveur de test. Il permet d'enregistrer les commandes instantanément sur un serveur.

## 2. Installer les dépendances

```bash
npm install
```

## 3. Enregistrer les commandes slash

```bash
npm run deploy:commands
```

Avec `GUILD_ID`, la commande `/pfc` est enregistrée sur ton serveur de test. Sans `GUILD_ID`, elle est enregistrée globalement, ce qui peut prendre plus de temps côté Discord.

## 4. Lancer le bot

```bash
npm start
```

## Utilisation

Dans Discord :

```text
/pfc adversaire:@membre
```

Le membre défié peut accepter ou refuser. Si la partie est acceptée, les deux joueurs choisissent secrètement pierre, feuille ou ciseaux via des boutons. Le bot révèle ensuite les choix et annonce le résultat.

## Ajouter un autre mini-jeu

1. Crée une nouvelle classe dans `src/games`.
2. Ajoute une commande slash dans `src/commands`.
3. Utilise `gameManager.createGame(...)` pour réserver les joueurs et nettoyer la partie à la fin.

