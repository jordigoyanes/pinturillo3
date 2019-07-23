async function start_game(io, gameState, room_index){ 
    let rooms = gameState.rooms;
    let current_room = rooms[room_index];
    current_room.current_round = 1;
    current_room.painter_index = 0;
    io.in(room_index).emit('update_round',{round: current_room.current_round})
    /*
    5 segundos para esperar a que acabe el turno
    7 segundos para elegir una de las 3 palabras a dibujar. 
    3 segundos para prepararse a dibujar.
    Si depues de 30 segundos el pintor no ha dibujado nada, se considera AFK.
    
    */
    //if room still exists (meaning there's players inside)
    if(current_room){
        start_turn(io, gameState ,room_index)
      //show final scoreboard of game
    }
    
}

function start_turn(io, gameState ,room_index){
    let rooms = gameState.rooms;
    // recursive function that will will give a turn for every player online for 3 rounds.
    if(rooms[room_index]){
        let current_room = rooms[room_index];
        let current_turn = {
            is_canceled: false,
            num_reports: 0,
            guessed:[  /* EXAMPLE => username: jordi, points_gained:234 */]
        }
        current_room.current_turn = current_turn;
        
        console.log("this is current round: "+current_room.current_round)
        
        // TURN START
    
        /*todo
    
        Give 3 word choices to the painter

        current_turn.word = d
    
        */
    
        // 3 second countdown to get ready to draw
        let sec = 3;
        console.log(sec)
        io.in(room_index).emit('get_ready_sec',{sec: sec})
        var interval = setInterval(function(){
            sec--;
            if(sec === 0){
                clearInterval(interval);
                io.in(room_index).emit('start_drawing',{username: current_room.players[current_room.painter_index].username});
                countdown_60_sec(io, room_index, gameState);
               
            }else{
                console.log(sec)
                io.in(room_index).emit('get_ready_sec',{sec: sec})
            }
        }, 1000)
    }
}

async function countdown_60_sec(io, room_index, gameState){
    let rooms = gameState.rooms;
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
                let isEndOfRound = current_room.painter_index + 1 == current_room.players.length;

                if(current_room.current_round != 3 && isEndOfRound){
                    current_room.painter_index = 0;
                    current_room.current_round++;
                    io.in(room_index).emit('update_round',{round: current_room.current_round})
                    start_turn(io, gameState ,room_index);
                }else if(current_room.current_round <= 3 && !isEndOfRound){
                    current_room.painter_index++;
                    start_turn(io, gameState ,room_index);
                }else if(current_room.current_round == 3 && isEndOfRound){
                    // if it is the end of the last round, the recursive loop will stop here 
                    // to show the final scoreboard and then run the game loop again.
                    console.log("GAME IS OVER!!!!")
                    console.log("here show the scoreboards")
                    console.log("new game started")
    
                    start_game(io, gameState, room_index)  
                }
        }
    }, 1000);
}

module.exports = start_game;