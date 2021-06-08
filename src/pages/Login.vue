<template>
	<div class="login">
		<h2>Welcome back!</h2>
		<div class="mb-6 text-gray-500 text-lg">Please log in to your account...</div>
			<div class="slider">
				<div class="step" ref="fstep" id="email">
					<form method="POST" @submit.prevent="next">
						<div class="field">
							<label>Email</label>
							<input type="email" name="email" v-model="email"/>
						</div>
						<button type="submit" class="btn primary" @click="next" :disabled="loadingNext">
							<template v-if="!loadingNext">
								Next
							</template>
							<template v-else>
								<Loading />
							</template>
						</button>
					</form>
				</div>
				<div class="step" id="password">
					<form method="POST" @submit.prevent="login">
						<div class="field">
							<label>
								<a href="#" id="forgot-password">Forgot your password?</a>
								Password
							</label>
							<input type="password" name="password" v-model="password"/>
						</div>
						<button class="btn primary" @click="login" :disabled="loggingIn">Login</button>
					</form>
					<div class="text-center mt-3 text-gray-400 cursor-pointer" @click="prev"><LeftChevron /> Back</div>
				</div>
			</div>
	</div>
	<teleport to="#app">
		<div class="login-bg"></div>
	</teleport>
</template>
<script>
import LeftChevron from '../icons/left-chevron.vue';
import Loading from '../icons/loading.vue';
import Cookies from '../helpers/cookies';
export default {
	components: {
		LeftChevron,
		Loading,
	},
	data() {
		return {
			step: 0,
			loadingNext: false,
			loggingIn: false,
			email: "",
			password: "",
			method: ""
		}
	},
	mounted() {
		let cookies = Cookies.get();
		let isAuthenticated = cookies.auth != undefined;

		if (isAuthenticated) {
			this.$router.push({name: 'home'})
		}
	},
	methods: {
		next() {
			this.loadingNext = true;
			var that = this; //resolve inside recaptcha
			// this.$recaptchaLoaded().then(function() {
			// 	that.$recaptcha('submit').then(token => {
					var nextdata = {
						userCreds: {
							next: true,
							username: that.email,
							recaptcha: 'token',
						}
					}
					that.$http.post('/v1/auth/login', nextdata).then(d=>{
						that.$refs.fstep.classList.add("moved");
						setTimeout(()=> {that.loadingNext = false;}, 300)
					}).catch(e => {
						if (e.response.status==400 && e.response.data.error=="auth required") {
							this.method = "password"
							that.$refs.fstep.classList.add("moved");
							setTimeout(()=> {that.loadingNext = false;}, 300)
						} else {
							that.loadingNext = false;
							alert(e)
						}
					})
			// 	}).catch(e => {
			// 		that.loadingNext = false;
			// 		alert(e)
			// 	})
			// })
		},
		prev() {
			this.$refs.fstep.classList.remove("moved");
		},
		login() {
			this.loggingIn = true;
			var uc = {userCreds: {
				username: this.email,
				password: this.password,
				recaptcha: "token",
				insecureLogin: true,
			}}
			this.$http.post('/v1/auth/login', uc).then(d => {
				this.$router.push({name: 'home'})
			}).catch(e => {
				alert(e)
			}).finally(() => {
				this.loggingIn = false;
			})
		}
	}
}
</script>
<style lang="scss">
.login-bg {
	@apply fixed w-full h-full z-0;

	// background-color: #393E44;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12' viewBox='0 0 20 12'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='charlie-brown' fill='%23000' fill-opacity='0.04'%3E%3Cpath d='M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
<style lang="scss" scoped>
.slider {
	@apply overflow-hidden flex flex-row flex-nowrap;
	width: calc(450px - 8rem);

	.step {
		@apply mr-6;
		flex: 0 0 100%; 
		width: calc(450px - 8rem);
		transition: margin-left ease-in-out .3s;

		&.moved {
			margin-left: calc(-100% - 1.5rem);
		}
	}
}

.login {
	@apply self-center mx-auto p-16 pb-8 text-left text-gray-100 z-10 bg-white rounded-lg shadow-md;
	width: 450px;

	h2 {
		@apply text-3xl text-yellow-500 font-bold;
	}
}

#forgot-password {
	@apply float-right text-sm text-gray-400 block;

	&:hover {
		@apply text-gray-500;
	}
}
</style>