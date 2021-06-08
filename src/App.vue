<template>
  <Sidebar/>
  <div id="main-view">
    <router-view></router-view>
  </div>
</template>
<script>
import Sidebar from './components/Sidebar.vue';

export default {
  components: {
    Sidebar,
  },
  methods: {
    isLoggedIn() {
      
    }
  }
}
</script>