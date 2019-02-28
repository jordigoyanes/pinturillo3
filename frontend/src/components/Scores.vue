<template>
  <div id="scores">
    <ul>
      <li v-for="player in orderedUsers" :key=player.score >
        <strong>player.name</strong> - Score: player.score
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
      playerlist: "playerlist"
    }),
    orderedUsers: function() {
      return _.orderBy(this.playerlist, "score");
    }
  }
};
</script>

<style lang="scss">
#scores {
  display: flex;
  flex: 1;
}
</style>
