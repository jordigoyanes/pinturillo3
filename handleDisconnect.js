module.exports.disconnect = handleDisconnect;

function handleDisconnect() {
    console.log('someone left: '+socket.username+ " room id: "+socket.room_id+ "isInroom: "+socket.isInRoom)
    if(socket.isInRoom){
        let room_id = socket.room_id;
        console.log("player: "+socket.username+" left room "+room_id)

        db.findOne({_id: room_id}, function(err,room){
            if(err){return console.err(err)}
            if(room.num_players - 1 == 0){
                db.remove({ _id: room_id }, {}, function (err, numRemoved) {
                    if(err){return console.err(err)}
                    io.in(room_id).emit('left_room', {
                        players: []
                    })
                    socket.isInRoom=false;
                    console.log("Room #ID: " + room_id + " has been removed from database for no players are inside.")
                });
            }else{
                db.update({ _id: room_id }, { $pull: { players: {username: socket.username} }, $set: {num_players: room.num_players-1} }, {}, function () {
                    socket.leave(room_id); 
                    db.findOne({_id: room_id}, function (err, updatedRoom) {
                        if(err){
                            return console.error(err)
                        }

                        io.in(room_id).emit('left_room', {
                            players: updatedRoom.players
                        })
                        io.in(room_id).emit("chat_evt", {
                            evt_type: "player_left",
                            username: socket.username
                        })
                        socket.isInRoom=false;
                        
                    });
                });
            }
        })
    }
 }