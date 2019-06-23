# Chat events

We have several types of SOCKET.IO chat events the game server can use to notify players of a sudden change in the game state, such as a new player joining, someone guessing the word, someone's turn to paint, etc.  

        data = {message: "pablo is going to draw", evt_type: "going_to_draw" }

### Types of chat events:
## guessed_word
You guessed it, happens when a player in the same room guesses the word.
## reported
When a player reports the painter. If all non-painter players report, the painter's turn gets cancelled. 
## going_to_draw
When a player is about to draw.
## player_left
When a player leaves the room.
## player_joined
When a player joins the room.