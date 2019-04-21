const express = require('express')
const app = express();
const path = require('path');
const genWords = require('./genWords.js');
const chat = require('./chat.js');
const game = require('./game.js');
const join = require('./handleJoin.js');
const handle = require('./handleDisconnect.js');

var Datastore = require('nedb')
  , db = new Datastore({ 
    filename: './rooms.db', 
    autoload: true 
  });

//middlewares
app.use(express.static(path.resolve(__dirname, './frontend/dist')));
// app.use(express.static('public'))

// Always redirect to Vue SPA:
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, './frontend/dist/index.html'));
});
  

//Listen on port 3000
server = app.listen(process.env.PORT || 3000)
console.log("Listening on port " + (process.env.PORT || 3000));

// pinturillo constants
const MAX_PLAYERS = 3;
const TIME_LIMIT = 99;

//socket.io instantiation
const io = require("socket.io")(server) 

//listen on every connection
io.on('connection', (socket) => {
    // ROUND handling
    // wait to next round
    socket.on('turn_start', (data) => {
        
    })
    
    // USER 
    console.log('New player connected')

    socket.on('create_room', (data) => {
        // Create private room in db:
        // data structure:
        let newRoom = {
            room_number: 2334,
            room_password: data.password,
            players:[
                {username: data.creator_player, score: 0},
            ],
            currentWord: 'hola',
            currentPainter: 'username',
            nextPainter:'username'
        }
        db.insert(newRoom, function (err, newDoc) {   // Callback is optional
            if(err){
                console.log(err)
            }
            console.log(newDoc)
          });
        // Make room creator join room
        socket.broadcast.emit('join_private_room', {message : data.message, username : data.username});
    })
    socket.on('join_private_room', (data) =>{
        //todo: join private room with matching password

    });

    socket.on('join_public_room', join.public(data));
    
    socket.on('player_guessed', (data) =>{
        // todo: Unidirectional score change coming from server. Clients cannot emit a score change.
        // todo: when client receive player_guessed, play animation and then wait 5 seconds.
        socket.broadcast.emit('player_guessed', data);
    }) 

    //drawing
    socket.on('drawing', (data) => io.in(socket.room_id).emit('drawing', data));  

    

//chat messages 
socket.on('new_message', (data) => {
        
    //broadcast the new message to others if it doesn't match word (in the same room).
    io.in(socket.room_id).emit('new_message', {message : data.message, username : data.username});
});
// CHAT EVENTS (emitted from the server only)
/*  
    data example:
    data = {message: "pablo is going to draw", evt_type: " " }
    Types of chat events:
        guessed_word
        reported
        going_to_draw
        player_left
        player_joined
*/
socket.on('chat_evt', (data) => {
    io.in(socket.room_id).emit('chat_evt', data);
});

    socket.on('disconnect', handle.disconnect(data));
})