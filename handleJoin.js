async function handleJoinPublicRoom(data) {
    console.log("oh boi")
    //join public room, only takes username
    var joiner = data.player;
    await db.find({room_type: "public", room_language: data.locale , num_players: { $lt: MAX_PLAYERS}}, function (err, docs) {
        if(err){ return console.error(err) }

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
                    if(err){return console.err(err)}
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
                if(err){return console.err(err)}
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
                // start game with first turn:
                io.in(newRoom._id).emit('new_turn', {
                    current_painter: joiner
                })
            });
        }
    }); 
}

module.exports.public = handleJoinPublicRoom;