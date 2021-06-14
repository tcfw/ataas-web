<template>
  <Sidebar/>
  <div id="main-view">
    <div id="top-left" v-if="loggedIn">
      <Notifications/>
      <Profile/>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import Sidebar from './components/Sidebar.vue';
import Profile from './components/Profile.vue';
import Notifications from './components/Notifications.vue';
import Cookies from './helpers/cookies';

export default {
  components: {
    Sidebar,
    Profile,
    Notifications,
  },
  data() {
    return {
      loggedIn: false,
      timer: {},
    }
  },
  created() {
    this.timer = setInterval(this.isLoggedIn, 500)
  },
  unmounted() {
    clearInterval(this.timer)
  },
  methods: {
    isLoggedIn() {
      let cookies = Cookies.get();
	    return this.loggedIn = cookies.auth != undefined;
    }
  }
}
</script>