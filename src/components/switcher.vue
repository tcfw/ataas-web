<template>
	<div class="switcher-wrapper">
		<div class="switcher" :class="{on: modelValue==true}" @click="switchValue">
			<div class="posval"></div>
		</div>
		<div class="label">
			<slot></slot>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		modelValue: Boolean,
	},
	emits: ['update:modelValue'],
	methods: {
		switchValue() {
			this.$emit('update:modelValue', !this.modelValue)
		}
	}
}
</script>
<style lang="scss" scoped>
.switcher-wrapper {
	@apply flex flex-row;
}

.label {
	@apply text-gray-500 text-sm mt-1;
}

.switcher {
	@apply rounded-full h-5 w-10 bg-gray-200 mt-1 mr-2 relative cursor-pointer;

	.posval {
		@apply rounded-full bg-white shadow h-5 w-5 absolute left-0;
		transition: left .15s ease-in-out;
	}

	&.on {
		@apply bg-yellow-500;

		.posval {
			left: 20px;
		}
	}
}
</style>