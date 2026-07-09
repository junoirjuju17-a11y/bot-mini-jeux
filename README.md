# Discord Mini Games Bot

Bot Discord en Node.js avec Discord.js. Il fournit une base extensible pour ajouter des mini-jeux et inclut un premier jeu : Pierre-Feuille-Ciseaux.

## Prérequis

- Node.js 18.17 ou plus récent
- Un bot Discord créé dans le Discord Developer Portal
- L'intent `Guilds`
- Pour les commandes texte `!pfc`, les intents `Guild Messages` et `Message Content`

## Fichiers importants pour GitHub

- `.env` contient tes vraies clés : il ne doit jamais être envoyé sur GitHub.
- `.env.example` est un modèle : il doit être envoyé sur GitHub.
- `env.example` est une copie visible du modèle, utile si ton outil masque les fichiers qui commencent par un point.
- `.gitignore` empêche Git d'ajouter `.env`, mais il ne retire pas un fichier déjà suivi par Git.

Si tu as déjà envoyé `.env` sur GitHub, retire-le du suivi Git puis change ton token Discord :

```bash
git rm --cached .env
git commit -m "Remove local env file"
```

## 1. Créer le fichier `.env`

Copie `.env.example` ou `env.example` vers `.env`, puis remplis les valeurs :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application_du_bot
GUILD_ID=id_du_serveur_de_test
PREFIX=!
ENABLE_MESSAGE_CONTENT_INTENT=false
```

- `DISCORD_TOKEN` : token du bot, à ne jamais publier.
- `CLIENT_ID` : identifiant de l'application Discord. Obligatoire seulement pour `npm run deploy:commands`.
- `GUILD_ID` : identifiant du serveur de test. Optionnel, mais recommandé pour enregistrer les commandes instantanément sur un serveur.
- `PREFIX` : préfixe des commandes texte. Par défaut : `!`.
- `ENABLE_MESSAGE_CONTENT_INTENT` : mets `true` pour activer les commandes texte.

Important : avant de mettre `ENABLE_MESSAGE_CONTENT_INTENT=true`, active **Message Content Intent** dans le Discord Developer Portal, section `Bot` puis `Privileged Gateway Intents`. Sinon Discord refusera la connexion avec l'erreur `Used disallowed intents`.

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

Commande slash existante :

```text
/pfc adversaire:@membre
```

Commandes texte, si `ENABLE_MESSAGE_CONTENT_INTENT=true` :

```text
!pfc @membre
!accepter
!refuser
!pierre
!feuille
!ciseaux
```

Le bot empêche un joueur de se défier lui-même, bloque les joueurs déjà occupés dans une partie, ignore les interactions des membres qui ne participent pas à la partie, puis annonce le résultat dans le salon.

Les choix envoyés avec `!pierre`, `!feuille` ou `!ciseaux` sont supprimés par le bot si ses permissions le permettent. Le bot confirme ensuite le choix en message privé quand c'est possible. Pour une meilleure confidentialité, donne au bot la permission `Manage Messages` dans le salon.

## Tester rapidement

1. Active **Message Content Intent** dans le Discord Developer Portal.
2. Mets `ENABLE_MESSAGE_CONTENT_INTENT=true` dans l'environnement du bot.
3. Lance le bot avec `npm start`.
4. Dans un salon Discord, écris `!pfc @joueur`.
5. Le joueur défié écrit `!accepter`.
6. Chaque joueur écrit l'un des choix : `!pierre`, `!feuille` ou `!ciseaux`.

## Ajouter un autre mini-jeu

1. Crée une nouvelle classe dans `src/games`.
2. Ajoute une commande slash ou une route texte dans `src/textCommands.js`.
3. Utilise `gameManager.createGame(...)` pour réserver les joueurs et nettoyer la partie à la fin.
