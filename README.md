# Pinturillo 3

Pinturillo clone made with Vue, Bulma CSS and Node.js.  
It uses socket.io to easily achieve real-time drawing, user chatting, and every other game event.
Stores user and game data using nedb.

[LIVE DEMO](https://pinturillo3.herokuapp.com)  
![Drag Racing](https://raw.githubusercontent.com/jordigoyanes/pinturillo3/master/docs/images/screenshot1.PNG)

### FEATURES:

- [x] Join public rooms
- [x] Real-time drawing with real-time chat
- [x] Language selection (English or Spanish)
- [x] Create and join private rooms

Game loop is still WIP

Maybe in the future

- User accounts with stats and saved drawings
- Premium account without ads and limitless storage of drawings
- Competitive Pintanary, tournaments for money, RANKETS!!

#### Test locally

First build the vue frontend:

```
cd frontend
npm run build
```

Run the nodejs server:

```
nodemon app
```

## [LIVE DOCUMENTATION](https://pinturillo3-docs.netlify.com)
