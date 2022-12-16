<template>
  <div id="app">
    <router-view />
  </div>
</template>


<style lang="scss">
html,
body {
  padding: 0px;
  margin: 0px;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

::-webkit-scrollbar {
  width: 8px;
  background-color: #1D1F21;
}

::-webkit-scrollbar-thumb {
  background-color: rgba($color: #fff, $alpha: .1);
}
</style>
