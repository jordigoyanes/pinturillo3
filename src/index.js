import express from 'express';
import path from 'path';
import nanoid from 'nanoid';

const app = express();
var start_game = require('./gameLoop.js');

//middlewares
app.use(express.static(path.resolve(__dirname, './frontend/dist')));
// app.use(express.static('public'))

// Always redirect to Vue SPA:
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './frontend/dist/index.html'));
});

//Listen on port 3000
let server = app.listen(process.env.PORT || 3000);
console.log('Listening on port ' + (process.env.PORT || 3000));

// pinturillo constants
const MAX_PLAYERS = 5;
const TIME_LIMIT = 99;

let gameState = {
  rooms: []
};

//socket.io instantiation
const io = require('socket.io')(server);

//listen on every connection
io.on('connection', (socket) => {
  // USER
  console.log('New player connected');

  socket.on('create_room', (data) => {
    // Create private room in db:
    // data structure:
    let newRoom = {
      room_number: 2334,
      room_password: data.password,
      players: [
        {
          username: data.creator_player,
          score: 0,
          points_gained: 0
        }
      ],
      currentWord: 'hola',
      currentPainter: 'username',
      nextPainter: 'username'
    };
    db.insert(newRoom, function(err, newDoc) {
      // Callback is optional
      if (err) {
        console.log(err);
      }
      console.log(newDoc);
    });
    // Make room creator join room
    socket.broadcast.emit('join_private_room', {
      message: data.message,
      username: data.username
    });
  });

  socket.on('join_private_room', (data) => {
    //todo: join private room with matching password
  });

  socket.on('join_public_room', async (data) => {
    let rooms = gameState.rooms;
    //join public room with public type, only takes username
    // check if public, has less than MAX_PLAYERS and same language
    var joiner = data.player;
    console.log('Esto es rooms length: ' + rooms.length);
    let found_room = rooms.find(function(room) {
      return (
        room &&
        room.type == 'public' &&
        room.language == data.locale &&
        room.players.length < MAX_PLAYERS
      );
    });
    if (found_room != undefined) {
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
      socket.is_waiting_next_round = true;
    } else {
      // create new public room and join in the first player
      // start the game with rounds
      let randomid = nanoid();
      let room = {
        index: randomid,
        type: 'public',
        language: data.locale,
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

  socket.on('player_guessed', (data) => {
    // todo: Unidirectional score change coming from server. Clients cannot emit a score change.
    // todo: when client receive player_guessed, play animation and then wait 5 seconds.
    socket.broadcast.emit('player_guessed', data);
  });

  //drawing
  socket.on('drawing', (data) => {
    let room = gameState.rooms.find((r) => {
      return r.index == socket.room_index;
    });

    function find_player(player) {
      return player.username === socket.username;
    }
    let painter = room.players.findIndex(find_player);
    if (painter == room.painter_index) {
      io.in(socket.room_index)
        .emit('drawing', data);
    }
  });

  //chat messages
  socket.on('new_message', (data) => {
    let room = gameState.rooms.find((r) => {
      return r.index == socket.room_index;
    });

    let word = room.current_turn.word;
    let has_already_guessed = room.current_turn.guessed.find(function(
      already_guessed
    ) {
      return already_guessed.username == socket.username;
    });

    let player_index = room.players.findIndex(function(element) {
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
            //points_gained: room.current_turn.countdown
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
  socket.on('choose_word', (data) => {
    let room = gameState.rooms.find((r) => {
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
  socket.on('chat_evt', (data) => {
    io.in(socket.room_index)
      .emit('chat_evt', data);
  });
  socket.on('clear_canvas', () => {
    io.in(socket.room_index)
      .emit('clear_canvas');
  });

  socket.on('disconnect', function() {
    let rooms = gameState.rooms;
    let room_index = socket.room_index;
    let room = rooms.find((r) => {
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
      let arrIndex = rooms.findIndex((r) => {
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
        function find_player(player) {
          return player.username === socket.username;
        }
        let player_gone = room.players.findIndex(find_player);
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
