<template>
  <div id="scores">
    <ul>
      <li v-for="(player, index) in orderedUsers" :key="index">
        <div v-if="player.username == localPlayer">
          <strong>{{ player.username }}</strong>
        </div>
        <div v-else>
          {{ player.username }}
        </div>
        - Score: {{ player.score }}
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
      localPlayer: "localPlayer"
    }),
    orderedUsers: function() {
      return _.orderBy(this.players, "score").reverse();
    }
  }
};
</script>

<style lang="scss">
#scores {
  width: 15em;
  padding: 1em;
  height: 85vh;
}
</style>
