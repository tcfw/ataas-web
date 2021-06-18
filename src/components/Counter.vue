<template>
	<div class="counter">
		<input type="text" maxlength="2" v-model="value" @blur="update"/>
		<div class="label">
			{{label}}
		</div>
		<div class="controls">
			<div @click="inc" @mousedown="startInc" @mouseup="stop">+</div>
			<div @click="dec" @mousedown="startDec" @mouseup="stop">-</div>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		modelValue: Number,
		label: {
			type: String,
			required: true,
		},
		max: {
			type: Number,
			default: 60,
		},
		min: {
			type: Number,
			default: 0,
		}
	},
	data() {
		return {
			value: 0,
			cTimer: null,
			dTimer: null,
			delta: 1,
		}
	},
	mounted() {
		this.value = this.modelValue;
	},
	emits: ['update:modelValue'],
	methods: {
		update() {
			if (this.value > this.max) {
				this.value = this.max
			} else if (this.value < this.min) {
				this.value = this.min
			}
			this.$emit('update:modelValue', parseInt(this.value))
		},
		inc() {
			this.value++
			this.update()
		},
		dec() {
			this.value--
			this.update()
		},
		startDec() {
			this.cTimer = setInterval(this.dec, 500)
			this.dTimer = setTimeout(() => {
				clearInterval(this.cTimer)
				this.cTimer = setInterval(this.dec, 200)
			}, 3500)
		},
		startInc() {
			this.cTimer = setInterval(this.inc, 500)
			this.dTimer = setTimeout(() => {
				clearInterval(this.cTimer)
				this.cTimer = setInterval(this.inc, 200)
			}, 3500)
		},
		stop() {
			clearInterval(this.cTimer)
			clearInterval(this.dTimer)
		},
	}
}
</script>
<style lang="scss" scoped>
.counter {
	@apply flex flex-row rounded-lg border border-gray-200 bg-white overflow-hidden;

	input {
		@apply w-16 h-12 rounded-r-none;
	}

	.label {
		@apply text-lg py-2 px-3 font-bold bg-gray-50 select-none;
	}

	.controls {
		@apply flex flex-col select-none;

		> div {
			@apply px-2 text-center bg-yellow-500 text-white cursor-pointer;

			&:hover {
				@apply bg-yellow-400;
			}
		}
	}
}
</style>