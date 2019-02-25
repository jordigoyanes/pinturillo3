<template>
  <div id="scores">
    <ul>
      <li>
        xfdfd
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "scores",
  computed:{
    ...mapState({
      playerlist: 'playerlist'
    }),
    orderedUsers: function () {
      return _.orderBy(this.playerlist, 'score')
    }
  }
};
</script>

<style lang="scss">
#scores{
  display:flex;
  flex:1;
}
</style>

