const express = require('express')
const app = express();
const path = require('path');
var start_game = require("./gameLoop.js");

//middlewares
app.use(express.static(path.resolve(__dirname, './frontend/dist')));
// app.use(express.static('public'))

// Always redirect to Vue SPA:
app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, './frontend/dist/index.html'));
});

//Listen on port 3000
server = app.listen(process.env.PORT || 3000)
console.log("Listening on port " + (process.env.PORT || 3000));

// pinturillo constants
const MAX_PLAYERS = 5;
const TIME_LIMIT = 99;


let gameState = {
    rooms:[]
}

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
            players: [{
                username: data.creator_player,
                score: 0
            }, ],
            currentWord: 'hola',
            currentPainter: 'username',
            nextPainter: 'username'
        }
        db.insert(newRoom, function(err, newDoc) { // Callback is optional
            if (err) {
                console.log(err)
            }
            console.log(newDoc)
        });
        // Make room creator join room
        socket.broadcast.emit('join_private_room', {
            message: data.message,
            username: data.username
        });
    })

    socket.on('join_private_room', (data) => {
        //todo: join private room with matching password
    });

    socket.on('join_public_room', async (data) => {
        let rooms = gameState.rooms
        //join public room with public type, only takes username
        // check if public, has less than MAX_PLAYERS and same language
        var joiner = data.player;
        console.log("Esto es rooms length: " + rooms.length)
        let found_room = rooms.find(function(room) {
            return room && room.type == "public" 
                    && room.language == data.locale
                    && room.players.length < MAX_PLAYERS;
        });  
        if (found_room != undefined) {
            let room = found_room;
            let new_joiner_name = joiner;
            // if player has same name as other player in room, concatenate room_index to name
            // as many times as necessary, to make it unique

            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].username == new_joiner_name) {
                    new_joiner_name += "-" + (room.index);
                }
            }
            
            let new_player = {
                username: new_joiner_name,
                score: 0
            }
            rooms[room.index].players.push(new_player)
            // send to client new player list with new player inside
            socket.join(room.index);
            socket.username = new_joiner_name;
            socket.room_index = room.index;
            socket.isInRoom = true;

            io.in(room.index).emit('joined_room', {
                players: room.players,
            })
            socket.emit('user_join', {
                id: room.index,
                original_joiner_name: joiner,
                new_joiner_name: new_joiner_name,
                players: room.players
            })
            io.in(room.index).emit('chat_evt', {
                evt_type: "player_joined",
                username: new_joiner_name
            })
            socket.is_waiting_next_round = true;

            /*
            socket.emit('wait_next_round');
            setTimeout(() => {
                io.in(socket.room_index).emit('new_turn', {
                    current_painter: joiner
                })
            }, 5000);
            */
        } else {
            // create new public room and join in the first player
            // start the game with rounds
            let room = {
                index: rooms.length,
                type: 'public',
                language: data.locale,
                players: [{
                    username: joiner,
                    score: 0
                }],
                currentWord: 'hola',
                currentPainter: 'username',
                nextPainter: 'username'
            }

            rooms.push(room);

            // Setting socket variables:
            socket.join(room.index);
            socket.username = joiner;
            socket.room_index = room.index;
            socket.isInRoom = true;
            socket.is_waiting_next_round = true;

            io.in(room.index).emit('joined_room', {
                players: room.players,
            })
            socket.emit('user_join', {
                id: room.index,
                original_joiner_name: joiner,
                new_joiner_name: joiner,
                players: room.players,
            })
            io.in(room.index).emit('chat_evt', {
                evt_type: "player_joined",
                username: joiner
            })
            // the first player to join will start the game loop
            await start_game(io, gameState, room.index);
        }
    });

    socket.on('player_guessed', (data) => {
        // todo: Unidirectional score change coming from server. Clients cannot emit a score change.
        // todo: when client receive player_guessed, play animation and then wait 5 seconds.
        socket.broadcast.emit('player_guessed', data);
    })

    //drawing
    socket.on('drawing', (data) => io.in(socket.room_index).emit('drawing', data));

    //chat messages 
    socket.on('new_message', (data) => {
        //broadcast the new message to others if it doesn't match word (in the same room).
        io.in(socket.room_index).emit('new_message', {
            message: data.message,
            username: data.username
        });
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
        io.in(socket.room_index).emit('chat_evt', data);
    });
    socket.on('clear_canvas', () => {
        io.in(socket.room_index).emit('clear_canvas');
    });

    socket.on('disconnect', function() {
        let rooms = gameState.rooms;
        let room = rooms[socket.room_index]
        console.log('someone left: ' + socket.username + " room id: " + socket.room_index + "isInroom: " + socket.isInRoom)
        if (socket.isInRoom) {
                let room_index = socket.room_index;
                console.log("player: " + socket.username + " left room " + room_index)
            
                if (room.players.length - 1 == 0) {
                    // borrar toda la sala directamente
                        rooms.splice(socket.room_index, 1)
                        
                        io.in(room_index).emit('left_room', {
                            players: []
                        })
                        socket.isInRoom = false;
                        console.log("Room #ID: " + room_index + " has been removed from database for no players are inside.")
                        
                } else {
                    // borrar solo ese jugador
                        function find_player(player) {
                            return player.username === socket.username;
                        }
                        let player_gone = room.players.findIndex(find_player);
                        room.players.splice(player_gone, 1)

                        socket.leave(room_index)
                        io.in(room_index).emit('left_room', {
                            players: room.players
                        })
                        io.in(room_index).emit("chat_evt", {
                            evt_type: "player_left",
                            username: socket.username
                        })
                        socket.isInRoom = false;
                }
        }
    });
})