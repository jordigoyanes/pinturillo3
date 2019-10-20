<template>
  <div id="scores" class="whitebox span-col-2 span-row-85">
    <ul>
      <li v-for="(player, index) in players" :key="index">
        <div class="score">
          <div class="pencil">
            <img v-if="player.username == painter" src="@/assets/pencil.svg" alt />
            <img v-else src="@/assets/pencil_gray.svg" alt />
          </div>
          <div class="right">
            <div v-if="player.username == localPlayer">
              <h2>
                <strong>{{ player.username }}</strong>
              </h2>
            </div>
            <h2 v-else>{{ player.username }}</h2>
            SCORE: {{ player.score }}
          </div>
          <div v-if="player.points_gained && player.points_gained !=0" class="new_points">
            <p>{{player.points_gained}}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "scores",
  computed: {
    ...mapState({
      players: "players",
      localPlayer: "localPlayer",
      painter: "painter"
    })
  }
};
</script>

<style lang="scss">
.new_points {
  background-image: url("../assets/star.svg");
  background-repeat: no-repeat;
  padding: 1rem;
  font-weight: bold;
  margin-left: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3em;
}
#scores {
  padding: 1em;
  width: 250px;
}
.score {
  border-bottom: 0.1rem solid #dbdbdb;
  padding: 0.5em;
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    width: 30px;
    height: 30px;
    margin-right: 1em;
  }
}

#scores h2 {
  font-family: "Kalam", bold;
  font-size: 23px;
}
</style>
