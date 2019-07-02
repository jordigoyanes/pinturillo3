async function start_game_loop(io, socket, db){ 
    // Make this a recursive function
    //while room is still active(has players inside):
    while(io.sockets.adapter.rooms[socket.room_id]){
       await countdown_3_sec(io, socket.room_id);
       await wait_5_sec(io, socket.room_id);
       await countdown_60_sec(io, socket.room_id);
       
        // start game with first turn:
        // io.in(room_id).emit('new_turn')
        
    }
    console.log("loop stoped cuz no players inside")

}
function wait_5_sec(io, room_id){
    function notify_sec() {
        console.log("5 sec countdown ended")
        //console.log("Seconds: "+secs)
        //io.in(room_id).emit('wait_finished',{secs: secs})
    }
    return new Promise(resolve => {
        setTimeout(() => resolve(notify_sec()), 5000)
    });
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

async function countdown_60_sec(io, room_id){
    let secs = 60;
    for(let i=60; i > 0; i--){
        await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 1000));
        secs--
    }
    function notify_sec() {
        console.log("Seconds: "+secs)
        io.in(room_id).emit('turn_countdown_sec',{secs: secs})
    }
}

function cancel_turn(){

}

module.exports = start_game_loop;