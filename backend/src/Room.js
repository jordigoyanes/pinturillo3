export default class Room {
  constructor(gameState, room_index, roomObj) {
    this.gameState = gameState;
    this.room_index = room_index;
    this.current_turn = {}
    this.gameState[this.room_index] = {}
    this.roomObj = this.gameState[this.room_index]
    this.roomObj.players = [];
    this.players = this.roomObj.players;
  }
  addPlayer(player) {
    this.roomObj.players.push(player);
    console.log(this.roomObj.players)
  }
  removePlayer() {

  }
  startTurn() {

  }
  showScoreboard() {

  }

  hi() {
    console.log("hi from room")
  }
}
