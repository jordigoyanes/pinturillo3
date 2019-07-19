async function start_rounds(io, socket, db){ 
    let rooms = io.sockets.adapter.rooms;
    let current_round = 1;
    /*
    5 segundos para esperar a que acabe el turno
    7 segundos para elegir una de las 3 palabras a dibujar. 
         
    */
    if(rooms[socket.room_id]){
       

       await countdown_3_sec(io, socket.room_id);
       await wait_5_sec(io, socket.room_id);
       await countdown_60_sec(io, socket.room_id);
       
        // start game with first turn:
        // io.in(room_id).emit('new_turn')

    }
    //console.log("loop stoped cuz no players inside")        

}
function wait_5_sec(io, room_id){
    function notify_sec() {
        console.log("5 sec countdown ended")
        //console.log("Seconds: "+sec)
        //io.in(room_id).emit('wait_finished',{sec: sec})
    }
    return new Promise(resolve => {
        setTimeout(() => resolve(notify_sec()), 5000)
    });
}
async function countdown_3_sec(io, room_id){
    let sec = 3;
    for(let i=3; i > 0; i--){
        await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 1000));
        sec--
    }
    function notify_sec() {
        console.log("Seconds: "+sec)
        io.in(room_id).emit('countdown_sec',{sec: sec})
    }
}

async function countdown_60_sec(io, room_id){
    let sec = 60;
    for(let i=60; i > 0; i--){
        await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 1000));
        sec--
    }
    function notify_sec() {
        console.log("Seconds: "+sec)
        io.in(room_id).emit('turn_countdown_sec',{sec: sec})
    }
}

function cancel_turn(){

}

module.exports = start_rounds;