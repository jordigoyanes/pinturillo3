import { Room, Player, GameState, CurrentTurn } from './index'


var genWords = require('./genWords.ts');
async function start_game(io: any, gameState: GameState, room_index: string) {
  let rooms = gameState.rooms;
  let current_room = rooms.find((r: Room) => { return r.index == room_index });

  /*
    5 segundos para esperar a que acabe el turno
    7 segundos para elegir una de las 3 palabras a dibujar. 
    3 segundos para prepararse a dibujar.
    Si depues de 30 segundos el pintor no ha dibujado nada, se considera AFK.
  */
  //if room still exists (meaning there's players inside)
  if (current_room) {
    current_room.current_round = 1;
    current_room.painter_index = 0;
    io.in(room_index)
      .emit('update_round', { round: current_room.current_round });
    start_turn(io, gameState, room_index);
    //show final scoreboard of game
  }
}

async function start_turn(io: any, gameState: GameState, room_index: string) {
  try {
    let rooms = gameState.rooms;
    let current_room: any = rooms.find((r) => { return r.index == room_index });

    // recursive function that will will give a turn for every player online for 3 rounds.
    if (current_room) {
      let current_turn: CurrentTurn = {
        word: '?',
        painter_left: false,
        is_canceled: false,
        num_reports: 0,
        revealed: [],
        countdown: 0,
        guessed: [
          /* EXAMPLE => username: jordi, points_gained:234 */
        ]
      };
      current_room.current_turn = current_turn;
      console.log("this is ROOM FROM Start turn: " + JSON.stringify(current_room))
      //set points_gained to 0 to all players, because new turn started
      for (let i = 0; i < current_room.players.length; i++) {
        current_room.players[i].points_gained = 0;
      }

      let painter_username =
        current_room.players[current_room.painter_index].username;
      console.log('this is painter username: ' + painter_username);
      console.log('this is current round: ' + current_room.current_round);

      let painter_socket_id;

      for (let socket in io.sockets.in(room_index)
        .connected) {
        if (
          io.sockets.in(room_index)
            .connected[socket].username == painter_username
        ) {
          console.log('this is the painter_username: ' + painter_username);
          console.log(
            'this is the socket id: ' +
            io.sockets.in(room_index)
              .connected[socket].id
          );
          painter_socket_id = socket;
        }
      }

      current_room.current_turn.painter_socket = painter_socket_id;

      // TURN START

      let options = genWords(current_room.language);
      console.log('my options: ' + options);
      current_room.current_turn.options = options;

      // random by default, painter has a few seconds to decide.
      let chosen_word = Math.floor(Math.random() * Math.floor(options.length));
      io.in(current_room)
        .emit('chat_evt', {
          username: painter_username,
          evt_type: 'going_to_draw'
        });

      io.to(painter_socket_id)
        .emit('show_options', options);

      /*todo: REMOVE AFK PLAYERS!!
       */

      let choose_sec = 7,
        get_ready_sec = 3;

      // time to let the painter choose the word (7 seconds)
      console.log("waiting 7 seconds...")
      while (current_turn.word == '?' && choose_sec > 0) {
        console.log(choose_sec)
        await sleep(1000);
        choose_sec--;
      }

      if (current_turn.word == '?') {
        current_turn.word = options[chosen_word];
      }
      io.in(room_index)
        .emit('reveal_word_length', {
          word_length: current_turn.word.length
        });
      io.to(painter_socket_id)
        .emit('reveal_word', { word: current_turn.word });

      // 3 second countdown to get ready to draw

      console.log("get ready to draw now")
      for (get_ready_sec; get_ready_sec > 0; get_ready_sec--) {
        console.log(get_ready_sec);
        io.in(room_index)
          .emit('get_ready_sec', { sec: get_ready_sec });
        await sleep(1000);
      }
      if (get_ready_sec === 0) {
        io.in(room_index)
          .emit('start_drawing');
        countdown_sec(io, room_index, gameState);
      }
    }
  } catch (e) {
    console.log("Error was catched in start_turn. Will start turn again.")
    console.log("This is err: " + e)

  }
}

async function countdown_sec(io: any, room_index: string, gameState: GameState) {
  const COUNTDOWN_TIME = 99;
  let rooms = gameState.rooms;
  let current_room = rooms.find((r) => { return r.index == room_index });
  if (current_room) {
    let word = current_room.current_turn.word;
    let current_turn = current_room.current_turn;
    current_turn.countdown = COUNTDOWN_TIME;
    let stop_time = false;

    let num_reveals = Math.ceil((word.length * 0.5));
    let freq = Math.floor(COUNTDOWN_TIME / num_reveals);
    let next_reveal_sec = COUNTDOWN_TIME - freq;

    while (!stop_time) {

      /* 
      error message if painter:
                cancels turn
                disconnects
                get reported by all other players.
                get reported by all other players.
      */
      let num_other_players = current_room.players.length - 1;
      let is_painter_reported =
        current_turn.num_reports == num_other_players &&
        current_turn.num_reports != 0;
      if (
        is_painter_reported ||
        current_turn.is_canceled ||
        current_turn.painter_left ||
        current_turn.countdown === 0 ||
        (current_turn.guessed.length == num_other_players &&
          current_turn.guessed.length != 0) ||
        !current_room
      ) {
        stop_time = true;
        if (current_turn.painter_left) {
          io.in(room_index)
            .emit('painter_left');
        }
        if (current_turn.is_canceled) {
          io.in(room_index)
            .emit('painter_canceled');
        }
        if (is_painter_reported) {
          io.in(room_index)
            .emit('painter_reported');
        }
        let isEndOfRound =
          current_room.painter_index + 1 == current_room.players.length;

        if (current_room.current_round != 3 && isEndOfRound) {
          current_room.painter_index = 0;
          current_room.current_round++;
          io.in(room_index)
            .emit('update_round', {
              round: current_room.current_round
            });
          io.in(room_index)
            .emit("reveal_word", {
              word: current_room.current_turn.word
            })
          io.in(room_index)
            .emit("show_scoreboard", {
              is_final: false
            })
          console.log("Wait 8 seconds before starting next turn")
          await sleep(8000);
          start_turn(io, gameState, room_index);
        } else if (current_room.current_round <= 3 && !isEndOfRound) {
          current_room.painter_index++;
          io.in(room_index)
            .emit("reveal_word", {
              word: current_room.current_turn.word
            })
          io.in(room_index)
            .emit("show_scoreboard", {
              is_final: false
            })
          console.log("Wait 8 seconds before starting next turn")
          await sleep(8000);
          start_turn(io, gameState, room_index);

        } else if (current_room.current_round == 3 && isEndOfRound) {
          // if it is the end of the last round, the recursive loop will stop here
          // to show the final scoreboard and then run the game loop again.
          console.log('GAME IS OVER!!!!');
          console.log('here show the scoreboards');
          let winner = current_room.players.sort(function (a, b) { return a.score - b.score })[0];
          io.in(room_index)
            .emit("show_scoreboard", {
              winner: winner.username,
              is_final: true
            })
          io.in(room_index)
            .emit("chat_evt", {
              evt_type: "player_won",
              username: winner.username
            })
          console.log('new game started');
          console.log("Wait 8 seconds before starting next game")
          await sleep(8000);
          for (let i = 0; i < current_room.players.length; i++) {
            current_room.players[i].score = 0;
          }
          io.in(room_index)
            .emit('score_change', {
              players: current_room.players,
            });

          start_game(io, gameState, room_index);
        }
      } else {
        if (current_turn.countdown === next_reveal_sec) {
          console.log("Time to reveal letter")
          let result, pos_to_reveal: number;
          do {
            pos_to_reveal = Math.floor(Math.random() * Math.floor(word.length))
            result = current_turn.revealed.find(letter_pos => letter_pos == pos_to_reveal);
          } while (result)
          current_turn.revealed.push(pos_to_reveal)
          // show hints every freq seconds
          io.in(current_room.index)
            .emit('reveal_letter', {
              letter: word[pos_to_reveal].toUpperCase(),
              pos: pos_to_reveal
            });
          next_reveal_sec -= freq;
        }
        io.in(current_room.index)
          .emit('turn_countdown_sec', {
            sec: current_turn.countdown
          });
        current_turn.countdown--;
        await sleep(1000);
      }
    }
  }
}

module.exports = start_game;

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
