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
- [ ] Create and join private rooms
- [ ] Fancy animations when users guess the word

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