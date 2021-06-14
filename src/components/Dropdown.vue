<template>
	<div 
		class="dropdown"
		:class="{open: open, up: direction=='up'}"
		@blur="blur"
		:tabindex="tabindex"
		ref="wrapper"
	>
		<select :name="name">
			<option :value="modelValue"></option>
		</select>
		<div class="input" @click="openOptions" ref="input">
			<template v-if="!selectedLabel">
				<span class="text-gray-400">{{placeholder}}</span>
			</template>
			<template v-else>
				{{selectedLabel}}
			</template>
			<DownChevron class="chev" />
		</div>
		<div class="options" :class="{hidden: !open}" ref="options">
			<div 
				v-for="(option, i) in options"
				:key="i"
				:class="{optgroup: isOptGroup(option), selected: modelValue==i, option: !isOptGroup(option)}"
				@click="selected(option, i)"
			>
				<template v-if="isOptGroup(option)">
					<span class="optgroup_label">{{i}}</span>
					<div
						v-for="(suboption, i) in option"
						:key="i"
						class="option"
						:class="{selected: modelValue==i}"
						@click="selected(suboption, i)"
					>
						{{suboption}}
					</div>
				</template>
				<template v-else>
					{{option}}
				</template>
			</div>
		</div>
	</div>
</template>
<script>
import DownChevron from '../icons/down-chevron.vue';

export default {
	props: {
		modelValue: String,
		name: String,
		options: Object,
		tabindex: {
			type: Number,
			default: 0
		},
		placeholder: {
			type: String,
			default: "Select an option..."
		},
	},
	components: {
		DownChevron,
	},
	data() {
		return {
			open: false,
			selectedLabel: "",
			direction: "down"
		}
	},
	emits: ['update:modelValue'],
	methods: {
		isOptGroup(option) {
			return Array.isArray(option) || typeof option === 'object';
		},
		openOptions() {
			this.open = !this.open;
			this.$refs.input.focus();
			this.$nextTick(()=>{
				this.checkBounds();
			})
		},
		blur() {
			this.open=false;
		},
		selected(option, i) {
			if (this.isOptGroup(option)) return;

			this.$emit('update:modelValue', i);
			this.selectedLabel = option;
			this.open = false;
		},
		checkBounds() {
			var c=this.$refs.options.getBoundingClientRect();
			var p=this.$refs.wrapper.parentElement;

			while (!p.classList.contains('dialog') && p != document.Body) {
				p = p.parentElement
			}

			if (p == null) return;

			p = p.getBoundingClientRect();

			if (c.top + c.height > p.top+p.height) {
				this.direction = 'up';
			} else {
				this.direction = 'down';
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.dropdown {
	@apply relative select-none;

	.chev {
		@apply absolute right-4 top-3 text-gray-600;
		transition: all .1s ease-in-out;
		transform: rotate(0deg);
	}

	select {display: none;}

	.input {
		@apply text-gray-900 shadow-inner border rounded py-2 px-3 cursor-pointer;
		background-color: #fafafb;

		&:focus {
			@apply border-gray-500 border outline-none;
		}
	}

	&.open {
		.chev {
			transform: rotate(180deg);
		}
	}

	&.up .options {
		@apply bottom-10 mt-0 mb-1;
		top: initial;
	}

	.options {
		@apply absolute top-10 mt-1 shadow-lg bg-white rounded w-full overflow-auto z-30;
		max-height: 250px;

		.option {
			@apply p-3 cursor-pointer;


			&.optgroup {
				@apply cursor-default;

				&:hover {
					@apply bg-transparent;
				}
			}

			&:hover {
				@apply bg-gray-100;
			}

			&.selected {
				@apply bg-yellow-400;
			}
		}

		> .option {
			&:first-child {
				@apply rounded-t;
			}

			&:last-child {
				@apply rounded-b;
			}
		}

		> .optgroup:last-child {
			> .option:last-child {
				@apply rounded-b;
			}
		}

		.optgroup {
			.option {
				@apply pl-5;
			}
			
			.optgroup_label {
				@apply text-gray-400 font-semibold text-sm m-3 block;
			}
		}
	}

}
</style>