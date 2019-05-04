async function start_game_loop(io, socket, db){ 
    console.log("has_people_in is " + io.sockets.adapter.rooms[socket.room_id].has_people_in);
    //while room is still active(has players inside):
    while(io.sockets.adapter.rooms[socket.room_id]){
        await countdown_3_sec(io, socket.room_id);
        // start game with first turn:
        // io.in(room_id).emit('new_turn')
        
    }

}
async function wait_5_sec(io){
    await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 5000));

    function notify_sec() {
        console.log("Seconds: "+secs)
        io.in(room_id).emit('wait_finished',{secs: secs})
    }
}
async function countdown_3_sec(io, room_id){
    let secs = 3;
    for(let i=3; i > 0; i--){
        await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 1000));
        secs--
    }
    function notify_sec() {
        console.log("Seconds: "+secs)
        io.in(room_id).emit('countdown_sec',{secs: secs})
    }
}

module.exports = start_game_loop;