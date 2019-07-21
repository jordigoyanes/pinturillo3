async function start_game(io, gameState, room_index){ 
    let rooms = gameState.rooms;
    let current_room = rooms[room_index];
    current_room.current_round = 1;
    current_room.painter_index = 0;
    
    /*
    5 segundos para esperar a que acabe el turno
    7 segundos para elegir una de las 3 palabras a dibujar. 
    
    */
    //if room still exists (meaning there's players inside)
    if(current_room){
      start_turn(io, rooms, room_index)
      //start_game(io, gameState, room_index)
    }
    //console.log("loop stoped cuz no players inside")        

}

function start_turn(io, rooms, room_index){
    // recursive function that will will give a turn for every player online for 3 rounds.
    
    let current_room = rooms[room_index];
    console.log("this is current round: "+current_room.current_round)

    let current_turn = {
        is_canceled: false,
        num_reports: 0,
        guessed:[  /* EXAMPLE => username: jordi, points_gained:234 */]
    }
    current_room.current_turn = current_turn;
    
    // TURN START
    // 3 second countdown to get ready to draw

    /*todo

    Give 3 word choices to the painter

    */
    let sec = 3;
    console.log(sec)
    io.in(room_index).emit('get_ready_sec',{sec: sec})
    var interval = setInterval(function(){
        sec--;
        if(sec === 0){
            clearInterval(interval);
            io.in(room_index).emit('start_drawing',{username: current_room.players[current_room.painter_index].username});
            countdown_60_sec(io, rooms, room_index);
           
        }else{
            console.log(sec)
            io.in(room_index).emit('get_ready_sec',{sec: sec})
        }
    }, 1000)

}

async function countdown_60_sec(io, rooms, room_index){

    let current_room = rooms[room_index];

    let sec = 60;
    let current_turn = current_room.current_turn;
    console.log(sec)
    io.in(current_room.index).emit('turn_countdown_sec',{sec: sec})

    let interval = setInterval(() => {
        sec--
        console.log(sec)
        io.in(current_room.index).emit('turn_countdown_sec',{sec: sec})
        /* error message if painter:
            cancels turn
            disconnects
            get reported by all other players.
        */
        let num_other_players = (current_room.players.length) - 1
        //console.log(this is )
        console.log("this is num other players: "+num_other_players)
        if(
            (current_turn.num_reports == num_other_players && current_turn.num_reports !=0)
            || current_turn.is_canceled 
            || sec === 0
            || (current_turn.guessed.length == num_other_players && current_turn.guessed.length !=0)
            || !rooms[room_index]
        ){
            
            clearInterval(interval);
        }
        console.log("this is current room: ");console.log(rooms[room_index])
    }, 1000);
}


function wait_5_sec(io, room_index){
    function notify_sec() {
        console.log("5 sec countdown ended")
        //console.log("Seconds: "+sec)
        //io.in(room_index).emit('wait_finished',{sec: sec})
    }
    return new Promise(resolve => {
        setTimeout(() => resolve(notify_sec()), 5000)
    });
}
async function countdown_3_sec(io, room_index){
    let sec = 3;
    for(let i=3; i > 0; i--){
        await new Promise(resolve => setTimeout(() => resolve(notify_sec()), 1000));
        sec--
    }
    function notify_sec() {
        console.log("Seconds: "+sec)
        io.in(room_index).emit('countdown_sec',{sec: sec})
    }
}


module.exports = start_game;