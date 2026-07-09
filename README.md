# Discord Mini Games Bot

Bot Discord en Node.js avec Discord.js. Il fournit une base extensible pour ajouter des mini-jeux et inclut un premier jeu : Pierre-Feuille-Ciseaux.

## Diagnostic Rapide

Au démarrage, la console affiche maintenant :

- les commandes slash chargées localement ;
- l'état des commandes texte ;
- les intents demandés ;
- la présence de `CLIENT_ID` et `GUILD_ID` ;
- un lien d'invitation avec les scopes `bot` et `applications.commands` ;
- le résultat de l'enregistrement des commandes slash si `REGISTER_COMMANDS_ON_START=true`.

Si `/pfc` n'apparaît pas, vérifie d'abord la console. Elle doit afficher une ligne comme :

```text
1 commande(s) slash enregistrée(s) (serveur 123456789).
Commandes slash visibles côté Discord: /pfc
```

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
ENABLE_MESSAGE_CONTENT_INTENT=true
REGISTER_COMMANDS_ON_START=true
```

- `DISCORD_TOKEN` : token du bot, à ne jamais publier.
- `CLIENT_ID` : identifiant de l'application Discord. Obligatoire pour enregistrer `/pfc`.
- `GUILD_ID` : identifiant du serveur de test. Recommandé, car les commandes serveur apparaissent rapidement.
- `PREFIX` : préfixe des commandes texte. Par défaut : `!`.
- `ENABLE_MESSAGE_CONTENT_INTENT` : mets `true` pour activer les commandes texte.
- `REGISTER_COMMANDS_ON_START` : mets `true` pour enregistrer automatiquement les commandes slash au démarrage.

Important : avant de mettre `ENABLE_MESSAGE_CONTENT_INTENT=true`, active **Message Content Intent** dans le Discord Developer Portal, section `Bot` puis `Privileged Gateway Intents`. Sinon Discord refusera la connexion avec l'erreur `Used disallowed intents`.

## 2. Inviter le bot correctement

Utilise le lien affiché dans la console au démarrage. Il contient les scopes nécessaires :

```text
bot applications.commands
```

Permissions conseillées :

- View Channel
- Send Messages
- Read Message History
- Manage Messages, optionnel mais utile pour supprimer les choix `!pierre`, `!feuille`, `!ciseaux`

Sans le scope `applications.commands`, les commandes slash ne peuvent pas apparaître sur ton serveur.

## 3. Installer les dépendances

```bash
npm install
```

## 4. Enregistrer les commandes slash

Si `REGISTER_COMMANDS_ON_START=true`, le bot le fait automatiquement au démarrage.

Tu peux aussi le faire manuellement :

```bash
npm run deploy:commands
```

Avec `GUILD_ID`, `/pfc` est enregistrée sur ton serveur et apparaît rapidement. Sans `GUILD_ID`, elle est enregistrée globalement et Discord peut mettre plus de temps à l'afficher.

## 5. Lancer le bot

```bash
npm start
```

## Utilisation

Commande slash :

```text
/pfc adversaire:@membre
```

Commandes texte :

```text
!pfc @membre
!accepter
!refuser
!pierre
!feuille
!ciseaux
```

Le bot empêche un joueur de se défier lui-même, bloque les joueurs déjà occupés dans une partie, ignore les membres qui ne participent pas à la partie, puis annonce le résultat dans le salon.

Les choix envoyés avec `!pierre`, `!feuille` ou `!ciseaux` sont supprimés par le bot si ses permissions le permettent. Le bot confirme ensuite le choix en message privé quand c'est possible.

## Guide de test étape par étape

1. Dans le Discord Developer Portal, active **Message Content Intent**.
2. Dans `.env`, mets `ENABLE_MESSAGE_CONTENT_INTENT=true`.
3. Vérifie que `CLIENT_ID`, `GUILD_ID` et `DISCORD_TOKEN` correspondent bien à la même application Discord.
4. Lance `npm start`.
5. Dans la console, vérifie que `/pfc` est chargée et enregistrée.
6. Invite le bot avec le lien affiché dans la console.
7. Dans ton serveur, teste `/pfc adversaire:@membre`.
8. Dans un salon Discord, teste `!pfc @membre`.
9. Le joueur défié écrit `!accepter`.
10. Chaque joueur écrit `!pierre`, `!feuille` ou `!ciseaux`.

## Ajouter un autre mini-jeu

1. Crée une nouvelle classe dans `src/games`.
2. Ajoute une commande slash ou une route texte dans `src/textCommands.js`.
3. Utilise `gameManager.createGame(...)` pour réserver les joueurs et nettoyer la partie à la fin.
