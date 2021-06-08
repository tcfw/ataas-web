<template>
	<div id="sidebar" :class="{'login':$route.name=='login'}">
		<router-link to="/"><Logo class="logo"></Logo></router-link>
		<div class="links">
			<!-- <router-link :to="{name: 'explore'}">Explore</router-link> -->
			<router-link :to="{name: 'blocks'}">
				<Blocks class="icon"/>
				Blocks
			</router-link>
			<!-- <router-link :to="{name: 'backtest'}">Test</router-link> -->
		</div>
	</div>
</template>
<script>
import Logo from './Logo.vue';
import Blocks from '../icons/blocks.vue';

export default {
	name: "Header",
	components: {
		Logo,
		Blocks,
	}
}
</script>
<style lang="scss" scoped>
.links a {
	@apply block text-white m-2 py-2 px-3 text-lg select-none align-middle;

	.icon {
		@apply inline-block h-6 w-6 mr-3 ml-1 -mt-1 align-middle;
	}

	&.router-link-active {
		@apply rounded-lg;
		background-color: rgba(255,255,255,0.1);
	}

	&:hover {
		@apply rounded-lg bg-gray-500;
	}
}
</style>