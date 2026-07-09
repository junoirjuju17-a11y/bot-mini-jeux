# Discord Mini Games Bot

Bot Discord en Node.js avec Discord.js. Il fournit une base extensible pour ajouter des mini-jeux et inclut un premier jeu : Pierre-Feuille-Ciseaux.

## Prérequis

- Node.js 18.17 ou plus récent
- Un bot Discord créé dans le Discord Developer Portal
- L'intent `Guilds`
- Pour les commandes texte `!pfc`, les intents `Guild Messages` et `Message Content`

## 1. Créer le fichier `.env`

Copie `.env.example` vers `.env`, puis remplis les valeurs :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application_du_bot
GUILD_ID=id_du_serveur_de_test
PREFIX=!
ENABLE_TEXT_COMMANDS=false
```

- `DISCORD_TOKEN` : token du bot, à ne jamais publier.
- `CLIENT_ID` : identifiant de l'application Discord. Obligatoire seulement pour `npm run deploy:commands`.
- `GUILD_ID` : identifiant du serveur de test. Optionnel, mais recommandé pour enregistrer les commandes instantanément sur un serveur.
- `PREFIX` : préfixe des commandes texte. Par défaut : `!`.
- `ENABLE_TEXT_COMMANDS` : mets `true` seulement si le **Message Content Intent** est activé dans le Discord Developer Portal.

Important : si `ENABLE_TEXT_COMMANDS=true` mais que le Message Content Intent n'est pas activé côté Discord, le bot peut être refusé par Discord avec l'erreur `Used disallowed intents`.

## 2. Installer les dépendances

```bash
npm install
```

## 3. Enregistrer les commandes slash

```bash
npm run deploy:commands
```

Cette étape exige `CLIENT_ID`. Avec `GUILD_ID`, la commande `/pfc` est enregistrée sur ton serveur de test. Sans `GUILD_ID`, elle est enregistrée globalement, ce qui peut prendre plus de temps côté Discord.

## 4. Lancer le bot

```bash
npm start
```

Pour lancer le bot, seul `DISCORD_TOKEN` est obligatoire. `CLIENT_ID` sert à enregistrer les commandes slash.

## Utilisation

Dans Discord :

```text
/pfc adversaire:@membre
```

Le membre défié peut accepter ou refuser. Si la partie est acceptée, les deux joueurs choisissent secrètement pierre, feuille ou ciseaux via des boutons. Le bot révèle ensuite les choix et annonce le résultat.

Si `ENABLE_TEXT_COMMANDS=true` et que le Message Content Intent est activé dans Discord, tu peux aussi jouer avec les commandes texte :

```text
!pfc @membre
!accepter
!refuser
!pierre
!feuille
!ciseaux
```

Les choix envoyés avec `!pierre`, `!feuille` ou `!ciseaux` sont supprimés par le bot si ses permissions le permettent. Le bot confirme ensuite le choix en message privé quand c'est possible.

## Ajouter un autre mini-jeu

1. Crée une nouvelle classe dans `src/games`.
2. Ajoute une commande slash dans `src/commands`.
3. Utilise `gameManager.createGame(...)` pour réserver les joueurs et nettoyer la partie à la fin.
