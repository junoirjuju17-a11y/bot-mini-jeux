# Discord Mini Games Bot

Bot Discord en Node.js avec Discord.js. Il fournit une base extensible pour ajouter des mini-jeux et inclut Pierre-Feuille-Ciseaux.

## Diagnostic Console

Au démarrage, la console affiche :

- commandes slash chargées localement ;
- état des commandes texte ;
- intents demandés ;
- `CLIENT_ID` du `.env` ;
- `CLIENT_ID` réel du bot connecté ;
- `GUILD_ID` utilisé ;
- lien d'invitation avec `bot` et `applications.commands` ;
- résultat de l'enregistrement de `/pfc`.

Si tu vois `Unknown Application`, le `CLIENT_ID` du `.env` ne correspond pas au token du bot. Le démarrage utilise maintenant l'ID réel du bot connecté pour corriger ça automatiquement, mais corrige quand même ton `.env`.

## Fichiers GitHub

- `.env` contient tes vraies clés : ne l'envoie jamais sur GitHub.
- `.env.example` est un modèle.
- `env.example` est une copie visible du modèle.
- `.gitignore` ignore `.env`, mais ne retire pas un fichier déjà suivi.

Si `.env` a déjà été envoyé :

```bash
git rm --cached .env
git commit -m "Remove local env file"
```

Puis régénère ton token Discord.

## Configuration `.env`

Copie `.env.example` ou `env.example` vers `.env` :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application_du_bot
GUILD_ID=id_du_serveur
PREFIX=!
ENABLE_MESSAGE_CONTENT_INTENT=true
REGISTER_COMMANDS_ON_START=true
```

- `DISCORD_TOKEN` : token du bot.
- `CLIENT_ID` : Application ID du même bot que le token.
- `GUILD_ID` : ID du serveur où tu veux voir `/pfc` rapidement.
- `PREFIX` : préfixe texte, par défaut `!`.
- `ENABLE_MESSAGE_CONTENT_INTENT` : `true` pour activer `!pfc`.
- `REGISTER_COMMANDS_ON_START` : `true` pour enregistrer `/pfc` au démarrage.

Important : si `GUILD_ID` est absent, Discord reçoit une commande globale. Elle peut mettre du temps à apparaître. Pour tester, mets toujours `GUILD_ID`.

## Activer Les Commandes Texte

Pour que `!pfc`, `!pierre`, `!feuille`, `!ciseaux` fonctionnent :

1. Discord Developer Portal.
2. Ton application.
3. Onglet `Bot`.
4. Active **Message Content Intent**.
5. Dans `.env`, mets :

```env
ENABLE_MESSAGE_CONTENT_INTENT=true
```

Sans ça, le bot démarre mais n'écoute pas `messageCreate`.

## Inviter Le Bot

Utilise le lien affiché dans la console. Il contient :

```text
bot applications.commands
```

Sans `applications.commands`, les slash commands ne peuvent pas apparaître.

Permissions conseillées :

- View Channel
- Send Messages
- Read Message History
- Manage Messages, utile pour supprimer les choix texte

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

Si `REGISTER_COMMANDS_ON_START=true`, `/pfc` est enregistré automatiquement.

Déploiement manuel possible :

```bash
npm run deploy:commands
```

## Test Étape Par Étape

1. Mets le bon `DISCORD_TOKEN`.
2. Mets le bon `CLIENT_ID`. Si tu as un doute, lance le bot : il affiche le `CLIENT_ID réel du bot connecté`.
3. Mets `GUILD_ID` avec l'ID de ton serveur.
4. Active **Message Content Intent** dans le portail Discord.
5. Mets `ENABLE_MESSAGE_CONTENT_INTENT=true`.
6. Lance `npm start`.
7. Vérifie dans la console :

```text
Commandes slash chargées localement: /pfc
Commandes texte: actives avec le préfixe !
1 commande(s) slash enregistrée(s) (serveur ...)
Commandes slash visibles côté Discord: /pfc
```

8. Sur Discord, teste :

```text
/pfc adversaire:@joueur
!pfc @joueur
!accepter
!pierre
!feuille
!ciseaux
```

## Ajouter Un Mini-Jeu

1. Crée une classe dans `src/games`.
2. Ajoute une commande slash ou une route texte dans `src/textCommands.js`.
3. Utilise `gameManager.createGame(...)` pour réserver les joueurs et nettoyer la partie à la fin.
