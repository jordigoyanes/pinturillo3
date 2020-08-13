import express from 'express';
import path from 'path';
import nanoid from 'nanoid';

const app = express();
var start_game = require('./gameLoop.ts');

//middlewares
app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

// app.use(express.static('public'))

// Always redirect to Vue SPA:
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

//Listen on port 3000
let server = app.listen(process.env.PORT || 3000);
console.log('Listening on port ' + (process.env.PORT || 3000));

// pinturillo constants
const MAX_PLAYERS: number = 5;

export interface Player {
  username: string,
  score: number,
  points_gained: number
}
export interface Room {
  index: string,
  type: string,
  language: string,
  password?: string,
  current_round: number,
  painter_index: number,
  players: Player[],
  current_turn: CurrentTurn
}
export interface CurrentTurn {
  word: string,
  painter_left: boolean,
  is_canceled: boolean,
  num_reports: number,
  revealed: any[],
  countdown: number,
  guessed: {
    username: string,
    points_gained: number
  }[]
}
export interface GameState {
  rooms: Room[]
}

let gameState: GameState = {
  rooms: []
};


//socket.io instantiation
const io = require('socket.io')(server);

//listen on every connection
io.on('connection', (socket: any) => {
  // USER
  console.log('New player connected');

  socket.on('join_private_room', async (data: any) => {
    //todo: join private room with matching password
    let rooms: Room[] = gameState.rooms;
    //join public room with public type, only takes username
    // check if public, has less than MAX_PLAYERS and same language
    var joiner = data.player;
    console.log('Esto es rooms length: ' + rooms.length);
    let found_room = rooms.find(function (room: any) {
      return (
        room &&
        room.index == data.room_id &&
        room.type == 'private' &&
        room.password == data.password &&
        room.language == data.locale &&
        room.players.length < MAX_PLAYERS
      );
    });
    if (!found_room) {
      socket.emit("error_private_room", { type: "not_found" });
    } else {
      let room = found_room;
      let new_joiner_name = joiner;
      // if player has same name as other player in room, concatenate room_index to name
      // as many times as necessary, to make it unique

      for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].username == new_joiner_name) {
          new_joiner_name += '-' + rooms.length;
        }
      }

      let new_player = {
        username: new_joiner_name,
        score: 0,
        points_gained: 0
      };

      found_room.players.push(new_player);
      // send to client new player list with new player inside
      socket.join(room.index);
      socket.username = new_joiner_name;
      socket.room_index = room.index;
      socket.isInRoom = true;

      io.in(room.index)
        .emit('joined_room', {
          players: room.players
        });
      socket.emit('user_join', {
        id: room.index,
        original_joiner_name: joiner,
        new_joiner_name: new_joiner_name,
        players: room.players,
        painter: room.players[room.painter_index].username,
        word: room.current_turn.word.length
      });
      io.in(room.index)
        .emit('chat_evt', {
          evt_type: 'player_joined',
          username: new_joiner_name
        });
    }
  });
  socket.on('create_private_room', async (data: any) => {
    //todo: join private room with matching password
    let rooms: Room[] = gameState.rooms;
    var joiner = data.player;
    console.log('Esto es rooms length: ' + rooms.length);
    let found_room = rooms.find(function (room: Room) {
      return (
        room &&
        room.index == data.room_id &&
        room.type == 'private' &&
        room.language == data.locale
      );
    });
    if (found_room != undefined) {

      socket.emit("error_private_room", { type: "already_exists" });
    } else {
      // create new private room and join in the first player
      // start the game with rounds
      let room: Room = {
        index: data.room_id,
        type: 'private',
        language: data.locale,
        password: data.password,
        current_round: 1,
        painter_index: 0,
        current_turn: {
          word: "",
          painter_left: false,
          num_reports: 0,
          is_canceled: false,
          countdown: 0,
          revealed: [],
          guessed: []
        },
        players: [
          {
            username: joiner,
            score: 0,
            points_gained: 0
          }
        ]
      };
      console.log('this is room index now: ' + room.index);

      rooms.push(room);

      // Setting socket variables:
      socket.join(room.index);
      socket.username = joiner;
      socket.room_index = room.index;
      socket.isInRoom = true;
      socket.is_waiting_next_round = true;

      io.in(room.index)
        .emit('joined_room', {
          players: room.players
        });
      socket.emit('user_join', {
        id: room.index,
        original_joiner_name: joiner,
        new_joiner_name: joiner,
        players: room.players
      });
      io.in(room.index)
        .emit('chat_evt', {
          evt_type: 'player_joined',
          username: joiner
        });
      // the first player to join will start the game loop

      await start_game(io, gameState, room.index);
    }
  });
  socket.on('join_public_room', async (data: any) => {
    try {
      let rooms: Room[] = gameState.rooms;
      //join public room with public type, only takes username
      // check if public, has less than MAX_PLAYERS and same language
      var joiner = data.player;
      console.log('Esto es rooms length: ' + rooms.length);
      let found_room: any = rooms.find(function (room: Room) {
        return (
          room &&
          room.type == 'public' &&
          room.language == data.locale &&
          room.players.length < MAX_PLAYERS
        );
      });
      if (found_room != undefined) {
        let room: Room = found_room;
        let new_joiner_name = joiner;
        // if player has same name as other player in room, concatenate room_index to name
        // as many times as necessary, to make it unique

        for (let i = 0; i < room.players.length; i++) {
          if (room.players[i].username == new_joiner_name) {
            new_joiner_name += '-' + rooms.length;
          }
        }

        let new_player: Player = {
          username: new_joiner_name,
          score: 0,
          points_gained: 0
        };

        found_room.players.push(new_player);
        // send to client new player list with new player inside
        socket.join(room.index);
        socket.username = new_joiner_name;
        socket.room_index = room.index;
        socket.isInRoom = true;

        io.in(room.index)
          .emit('joined_room', {
            players: room.players
          });
        socket.emit('user_join', {
          id: room.index,
          original_joiner_name: joiner,
          new_joiner_name: new_joiner_name,
          players: room.players,
          painter: room.players[room.painter_index].username,
          word: room.current_turn.word.length
        });
        io.in(room.index)
          .emit('chat_evt', {
            evt_type: 'player_joined',
            username: new_joiner_name
          });

      } else {
        // create new public room and join in the first player
        // start the game with rounds
        let randomid = nanoid();
        let room: Room = {
          index: randomid,
          type: 'public',
          language: data.locale,
          current_round: 1,
          painter_index: 0,
          current_turn: {
            word: "",
            painter_left: false,
            num_reports: 0,
            is_canceled: false,
            countdown: 0,
            revealed: [],
            guessed: []
          },
          players: [
            {
              username: joiner,
              score: 0,
              points_gained: 0
            }
          ]
        };
        console.log('this is room index now: ' + room.index);
        rooms.push(room);

        // Setting socket variables:
        socket.join(room.index);
        socket.username = joiner;
        socket.room_index = room.index;
        socket.isInRoom = true;
        socket.is_waiting_next_round = true;

        io.in(room.index)
          .emit('joined_room', {
            players: room.players
          });
        socket.emit('user_join', {
          id: room.index,
          original_joiner_name: joiner,
          new_joiner_name: joiner,
          players: room.players

        });
        io.in(room.index)
          .emit('chat_evt', {
            evt_type: 'player_joined',
            username: joiner
          });
        // the first player to join will start the game loop

        await start_game(io, gameState, room.index);
      }

    } catch (e) {
      console.log("Error joining player")
      console.log(e)
    }
  });

  //drawing
  socket.on('drawing', (data: any) => {
    let room: any = gameState.rooms.find((r: Room) => {
      return r.index == socket.room_index;
    });

    let painter = room.players.findIndex((p: Player) => { return p.username === socket.username; });
    if (painter == room.painter_index) {
      io.in(socket.room_index)
        .emit('drawing', data);
    }
  });

  //chat messages
  socket.on('new_message', (data: any) => {
    let room: any = gameState.rooms.find((r: any) => {
      return r.index == socket.room_index;
    });

    let word = room.current_turn.word;
    let has_already_guessed = room.current_turn.guessed.find(function (
      already_guessed: Player
    ) {
      return already_guessed.username == socket.username;
    });

    let player_index = room.players.findIndex(function (element: Player) {
      return element.username == socket.username;
    });

    if (data.message.includes(word) && word != '') {
      if (
        !has_already_guessed &&
        socket.username != room.players[room.painter_index].username
      ) {
        // change score
        if (room.current_turn.countdown !== 0) {

          room.players[player_index].score += room.current_turn.countdown;
          room.players[room.painter_index].score += 5;
          room.players[player_index].points_gained += room.current_turn.countdown;
          room.players[room.painter_index].points_gained += 5;

          room.current_turn.guessed.push({
            username: socket.username
          });

          io.in(socket.room_index)
            .emit('score_change', {
              players: room.players,
            });
          io.in(socket.room_index)
            .emit('chat_evt', {
              username: socket.username,
              evt_type: 'guessed_word'
            });
        }
      }
    } else {
      //broadcast the new message to others if it doesn't match word (in the same room).
      io.in(socket.room_index)
        .emit('new_message', {
          message: data.message,
          username: data.username
        });
    }
  });
  socket.on('choose_word', (data: any) => {
    let room: any = gameState.rooms.find((r: any) => {
      return r.index == socket.room_index;
    });
    // must be valid index
    if (data.option_index >= 0 && data.option_index <= 3) {
      room.current_turn.word = room.current_turn.options[data.option_index];
    }
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
  socket.on('chat_evt', (data: any) => {
    io.in(socket.room_index)
      .emit('chat_evt', data);
  });
  socket.on('clear_canvas', () => {
    io.in(socket.room_index)
      .emit('clear_canvas');
  });

  socket.on('disconnect', function () {
    let rooms = gameState.rooms;
    let room_index = socket.room_index;
    let room: any = rooms.find((r: any) => {
      return r.index == socket.room_index;
    });
    console.log(
      'someone left: ' +
      socket.username +
      ' room id: ' +
      socket.room_index +
      ' isInroom: ' +
      socket.isInRoom +
      ' room_index: ' +
      socket.room_index
    );

    if (socket && socket.isInRoom && room) {
      let arrIndex = rooms.findIndex((r: Room) => {
        return r.index == socket.room_index;
      });
      if (room.players.length - 1 == 0) {
        // borrar toda la sala directamente
        rooms.splice(arrIndex, 1);
        io.in(room_index)
          .emit('left_room', {
            players: []
          });
        socket.isInRoom = false;
        socket.leave(room_index);
        console.log(
          'Room #ID: ' +
          room_index +
          ' has been removed from database for no players are inside.'
        );
        console.log('This is gamestate: ');
        console.log(gameState);
      } else {
        // borrar solo ese jugador

        let player_gone = room.players.findIndex((p: Player) => { return p.username === socket.username });

        if (player_gone == room.painter_index) {
          room.current_turn.painter_left = true;
        }
        room.players.splice(player_gone, 1);
        console.log('This is gamestate: ');
        console.log(gameState);

        socket.isInRoom = false;
        socket.leave(room_index);
        io.in(room_index)
          .emit('left_room', {
            players: room.players
          });
        io.in(room_index)
          .emit('chat_evt', {
            evt_type: 'player_left',
            username: socket.username
          });
      }
    }
  });
});
