# Pinturillo 3

Pinturillo clone made with Vue, Bulma CSS and Node.js.  
It uses socket.io to easily achieve real-time drawing, user chatting, and every other game event.
Stores user and game data using in-memory javascript objects.

[LIVE DEMO](https://pinturillo3.herokuapp.com)

![Screenshot](https://i.imgur.com/HmzoRiR.png)

### FEATURES:

- [x] Join public rooms
- [x] Real-time drawing with real-time chat
- [x] Language selection (English or Spanish)
- [x] Create and join private rooms


Maybe in the future

- User accounts with stats and saved drawings
- Premium account without ads and limitless storage of drawings
- Competitive Pintanary, tournaments for money, RANKETS!!

### Test locally

First, install all the NPM dependencies in both backend and frontend:
```
npm i
cd frontend
npm i
```

#### Run production server

Build the vue frontend:

```
npm run build
```

Run the nodejs server:

```
npm run watch
```
#### Run development server
Run the frontend server
```
cd frontend
npm run serve
```

Run the node.js backend server:

```
npm run watch
```

## [LIVE DOCUMENTATION](https://pinturillo3-docs.netlify.com)