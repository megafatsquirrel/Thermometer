<template>
  <div id="app">
    <div>
      <img class="img-size" alt="tea" src="./assets/tea.jpg">
    </div>
    <Thermometer />
  </div>
</template>

<script>
import Thermometer from './components/Thermometer.vue'

export default {
  name: 'app',
  components: {
    Thermometer
  }
}
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  background-color: #f7f5f5;
}
.img-size {
  width: 150px;
}
</style>
