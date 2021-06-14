<template>
	<div class="profile" @click="toggleMenu">
		<div class="pic">
			<User class="user" v-if="pic==''"/>
		</div>
		<DownChev class="chev" />
	</div>
	<teleport to="body">
		<div v-if="showMenu" class="menu" tabindex="0" @blur="toggleMenu" ref="menu">
			<div class="me" v-if="me">{{me.firstName}} {{me.lastName}}</div>
			<div class="controls">
				<div class="control" @click="settings">
					Settings
				</div>
				<div class="control" @click="logout">
					Log out
				</div>
			</div>
		</div>
	</teleport>
</template>
<script>
import DownChev from '../icons/down-chevron.vue';
import User from '../icons/user.vue';

export default {
	components: {
		DownChev,
		User,
	},
	data() {
		return {
			pic: "",
			showMenu: false,
			allowToggle: true
		}
	},
	created() {
		if (this.$store.state.me.remoteState != "loaded") {
			this.$store.dispatch('me/fetch');
		}
	},
	computed: {
		me() {
			return this.$store.state.me.me
		}
	},
	methods: {
		toggleMenu() {
			if (!this.allowToggle) return

			this.showMenu = !this.showMenu
			this.allowToggle = false
			if (this.showMenu) {
				this.$nextTick(() => this.$refs.menu.focus())
			}
			setTimeout(()=>{this.allowToggle = true}, 100)
		},
		settings() {
			this.toggleMenu()
			this.$router.push('/settings');
		},
		logout() {
			this.toggleMenu()
			this.$http.post('/v1/auth/revoke').then(d => {
				this.$root.isLoggedIn();
				this.$router.push({name:'login'})
			}).catch((e) => {
				alert(e);
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.profile {
	@apply flex flex-row items-center cursor-pointer select-none;

	.pic {
		@apply bg-gray-700 rounded-lg h-9 w-9 mr-4 bg-no-repeat bg-center bg-contain flex items-end;

		.user {
			@apply text-yellow-500 h-7 w-7 mx-auto;

			&:deep(.fa-secondary) {
				@apply text-gray-300;
			}
		}
	}

	.chev {
		@apply text-gray-800;

	}	
}

.menu {
	@apply absolute top-14 right-4 bg-gray-700 rounded-lg text-white p-2 shadow-xl outline-none;

	.me {
		@apply text-right my-3 text-lg mr-3;
	}

	.controls {
		@apply flex flex-row justify-items-end mx-2;

		.control {
			@apply rounded-lg bg-gray-600 p-3 m-1 cursor-pointer;

			&:hover {
				@apply bg-gray-500;
			}
		}
	}
}
</style>