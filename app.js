const express = require('express')
const app = express();
const path = require('path');
var Datastore = require('nedb')
  , db = new Datastore();

//middlewares
app.use(express.static('./frontend/dist'));
// app.use(express.static('public'))

// Always redirect to Vue SPA:
app.get('*', function (request, response) {
    response.sendFile('./frontend/dist/index.html');
});

//Listen on port 3000
server = app.listen(process.env.PORT || 3000)

//socket.io instantiation
const io = require("socket.io")(server) 

// pinturillo constants
const MAX_PLAYERS = 10;

//listen on every connection
io.on('connection', (socket) => {
    console.log('New player connected')
    socket.on('create_room', (data) => {
        // Create private room in db:
        // data structure:
        let newRoom = {
            _id: '__autoid__',
            room_number: 2334,
            room_password: 'a',
            players:[
                {username: 'jordi', score: 97},

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
        socket.broadcast.emit('join_room', {message : data.message, username : data.username});
    })

    socket.on('join_room', (data) => socket.broadcast.emit('join_room', data));
    socket.on('leave_room', (data) =>{
        //if 0 players, remove room from db
        socket.broadcast.emit('leave_room', data);
    }) 

    
    socket.on('player_guessed', (data) =>{
        
        socket.broadcast.emit('player_guessed', data);
    }) 

    //drawing
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));  

    //chat messages 
    socket.on('new_message', (data) => {
        
        //broadcast the new message to others if it doesn't match word.
        io.sockets.emit('new_message', {message : data.message, username : data.username});
    })

})

