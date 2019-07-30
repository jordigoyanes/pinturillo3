var genWords = require("./genWords.js");
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
            word: "",
            painter_left: false,
            is_canceled: false,
            num_reports: 0,
            guessed:[  /* EXAMPLE => username: jordi, points_gained:234 */]
        }
        current_room.current_turn = current_turn;
        
        let painter_username = current_room.players[current_room.painter_index].username
        console.log("this is painter username: "+painter_username)
        console.log("this is current round: "+current_room.current_round)

        let painter_socket_id;

        for(socket in io.sockets.in(room_index).connected){
            if(io.sockets.in(room_index).connected[socket].username == painter_username){
                console.log("this is the painter_username: "+painter_username)
                console.log("this is the socket id: "+io.sockets.in(room_index).connected[socket].id)
                painter_socket_id = socket;
            }
        }
                
                
        current_room.current_turn.painter_socket = painter_socket_id;

        // TURN START
    
        let options = genWords(current_room.language);
        console.log("my options: "+options)
        current_room.current_turn.options = options;
        // random by default, painter has a few seconds to decide.
        let chosen_word = Math.floor(Math.random() * Math.floor(options.length));

        io.to(painter_socket_id).emit("show_options", options);

        /*todo: REMOVE AFK PLAYERS!!

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
                //painter_socket.emit('start_drawing',{word: "papa"});
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
    let sec = 99;
    if(current_room){
        let current_turn = current_room.current_turn;
        console.log(sec)
        io.in(current_room.index).emit('turn_countdown_sec',{sec: sec})
    
        let interval = setInterval(() => {
            sec--
            //console.log(sec)
            io.in(current_room.index).emit('turn_countdown_sec',{sec: sec})
            /* error message if painter:
                cancels turn
                disconnects
                get reported by all other players.
                get reported by all other players.
            */
            let num_other_players = (current_room.players.length) - 1
            let is_painter_reported = current_turn.num_reports == num_other_players && current_turn.num_reports !=0;
    
            if(
                is_painter_reported
                || current_turn.is_canceled 
                || current_turn.painter_left
                || sec === 0
                || (current_turn.guessed.length == num_other_players && current_turn.guessed.length !=0)
                || !rooms[room_index]
            ){
                clearInterval(interval);
                if(current_turn.painter_left){
                    io.in(room_index).emit('painter_left')
                }
                if(current_turn.is_canceled){
                    io.in(room_index).emit('painter_canceled')
                }
                if(is_painter_reported){
                    io.in(room_index).emit('painter_reported')
                }
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
}

module.exports = start_game;