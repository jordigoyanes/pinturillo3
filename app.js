const express = require('express')
const app = express();
const path = require('path');
var genWords = require('./genWords.js');
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
        //todo: join private room

    });

    socket.on('join_public_room', async (data) =>{
        //join public room, only takes username
        var joiner = data.player;
        await db.find({room_type: "public", room_language: data.locale , num_players: { $lt: MAX_PLAYERS}}, function (err, docs) {
            if(err){
                console.log(err)
            }else{
                if(docs.length > 0){
                    let randpick = Math.floor(Math.random() * Math.floor(docs.length));
                    let room = docs[randpick];
                    let new_joiner_name = joiner;
                    // if player has same name as other player in room, concatenate room_id to name
                    // as many times as necessary, to make it unique
                    for(let i = 0; i < room.players.length; i++)
                    {
                        if(room.players[i].username == new_joiner_name){
                            new_joiner_name += "-" + (room._id).substring(0,5)
                        }
                    }
                    // make socket join room so only this socket gets notified of 'joined_room'
                    socket.join(room._id);
                    db.update({ _id: room._id }, { $push: { players: {username: new_joiner_name, score: 0} }, $set: {num_players: room.num_players+1} }, {}, function () {
                        
                            db.findOne({_id: room._id}, function (err, updatedRoom) {
                                if(!err){
                                    // io.sockets.adapter.rooms[room._id].room_id = room._id;
                                    // send to client new player list with new player inside
                                    socket.username = new_joiner_name;
                                    socket.room_id = room._id;
                                    socket.isInRoom = true;
                                    io.in(room._id).emit('joined_room', {
                                        players:  updatedRoom.players,
                                    })
                                    socket.emit('user_join', {
                                        id: updatedRoom._id,
                                        original_joiner_name: joiner,
                                        new_joiner_name: new_joiner_name,
                                        players: updatedRoom.players
                                    })
                                    io.in(room._id).emit('chat_evt', {
                                        evt_type: "player_joined",
                                        username: new_joiner_name
                                    })
                                    socket.is_waiting_next_round=true;
                                    
                                    socket.emit('wait_next_round');

                                }else{
                                    console.log(err)
                                }
                            });

                    });
                }else{
                    // create new public room and join in the first player
                    // start the game with rounds
                    let room = {
                    room_type: 'public',
                    room_language: data.locale,
                    num_players: 1,
                    players:[
                    {username: joiner, score: 0},
                    ],
                    currentWord: 'hola',
                    currentPainter: 'username',
                    nextPainter:'username'
                    }
                    
                    db.insert(room, function (err, newRoom) {
                        if(err){
                        console.log(err)
                        }else{
                            socket.join(newRoom._id);
                            socket.username=joiner;
                            socket.room_id=newRoom._id;
                            socket.isInRoom=true;
                            io.in(newRoom._id).emit('joined_room', {
                                players:  room.players,
                            })
                            socket.emit('user_join', {
                                id: newRoom._id,
                                original_joiner_name: joiner,
                                new_joiner_name: joiner,
                                players:  room.players,
                            })
                            io.in(newRoom._id).emit('chat_evt', {
                                evt_type: "player_joined",
                                username: joiner
                            })
                
                        }
                    });
                }

            }

        });
        
    });

    
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

    socket.on('disconnect', function() {
        console.log('someone left: '+socket.username+ " room id: "+socket.room_id+ "isInroom: "+socket.isInRoom)
        if(socket.isInRoom){
            let room_id = socket.room_id;
            console.log("player: "+socket.username+" left room "+room_id)
    
            db.findOne({_id: room_id}, function(err,room){
                if(room.num_players - 1 == 0){
                    db.remove({ _id: room_id }, {}, function (err, numRemoved) {
                        if(err){
                            console.log(err)
                        }else{
                            io.in(room_id).emit('left_room', {
                                players: []
                            })
                            socket.isInRoom=false;
                            console.log("Room #ID: " + room_id + " has been removed from database for no players are inside.")
                        }
                    });
                }else{
                    db.update({ _id: room_id }, { $pull: { players: {username: socket.username} }, $set: {num_players: room.num_players-1} }, {}, function () {
                        socket.leave(room_id); 
                        db.findOne({_id: room_id}, function (err, updatedRoom) {
                            if(err){
                                console.log(err)
                            }else{
                                io.in(room_id).emit('left_room', {
                                    players: updatedRoom.players
                                })
                                io.in(room_id).emit("chat_evt", {
                                    evt_type: "player_left",
                                    username: socket.username
                                })
                                socket.isInRoom=false;
                            }
                        });
                    });
                }
            })
        }
     });
})

