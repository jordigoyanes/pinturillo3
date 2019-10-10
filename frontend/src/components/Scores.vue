<template>
  <div id="scores" class="whitebox span-col-2 span-row-85">
    <ul>
      <li v-for="(player, index) in orderedUsers" :key="index">
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
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import _ from "lodash";
import { mapState } from "vuex";
export default {
  name: "scores",
  computed: {
    ...mapState({
      players: "players",
      localPlayer: "localPlayer",
      painter: "painter"
    }),
    orderedUsers: function() {
      return _.orderBy(this.players, "score").reverse();
    }
  }
};
</script>

<style lang="scss">
#scores {
  padding: 1em;
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
