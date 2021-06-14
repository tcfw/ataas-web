<template>
	<div class="flex flex-col w-full">
		<h2 class="pageheader block">Settings</h2>
		<div class="flex flex-row">
			<div class="settings-menu">
				<router-link to="/settings/profile">Profile</router-link>
				<router-link to="/settings/security">Security</router-link>
				<router-link to="/settings/exchanges">Exchanges</router-link>
			</div>
			<div class="flex-grow">
				<router-view></router-view>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.settings-menu {
	@apply w-1/6 mr-5; //border-r border-gray-300 

	h3 {
		@apply text-gray-500 pb-5 text-lg;
	}

	a {
		@apply block p-2 mr-2 -ml-2 rounded;

		&:hover {
			@apply bg-gray-300;
		}

		&.router-link-active {
			@apply bg-gray-600 text-white;
		}
	}
}
</style>