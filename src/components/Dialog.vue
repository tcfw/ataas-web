<template>
	<teleport to="body" v-if="visible">
		<div class="wrapper">
			<div class="inner">
				<div class="bg-wrapper">
					<div class="bg" @click="emitBgClick"></div>
				</div>

				<!-- This element is to trick the browser into centering the modal contents. -->
				<span class="center-t"></span>&#8203;
				
				<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
					<div class="dialog-body">
						<div class="sm:flex sm:items-start">
							<slot name="icon"></slot>
							<div class="dialog-content">
								<h3 id="modal-headline">
									<slot name="header"></slot>
								</h3>
								<div class="modal-body">
									<slot name="body"></slot>
								</div>
							</div>
						</div>
					</div>
					<div v-if="hasFooter()" class="dialog-footer">
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>
<script>
export default {
	props: {
		visible: Boolean
	},
	emits: ['bgClick'],
	methods: {
		hasFooter() {
			return !!this.$slots.footer
		},
		emitBgClick() {
			this.$emit('bgClick')
		}
	},
}
</script>
<style lang="scss" scoped>
.wrapper {
	@apply fixed z-50 inset-0 overflow-y-auto transition ease-in-out;

	.inner {
		@apply flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center;

		@screen sm {
			@apply block p-0;
		}

		.bg-wrapper {
			@apply fixed inset-0 transition-opacity;

			.bg {
				@apply absolute inset-0 bg-gray-600 opacity-75;
			}
		}
	}

	.center-t {
		@apply hidden;

		@screen sm {
			@apply inline-block align-middle h-screen;
		}
	}

	.dialog {
		@apply inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all;

		@screen sm {
			@apply my-8 align-middle max-w-3xl w-full;
		}

		&-body {
			@apply bg-white px-4 pt-5 pb-4;

			@screen sm {
				@apply p-6 pb-4;
			}

			#modal-headline {
				@apply text-sm leading-6 text-gray-600 mb-4;
			}

			

			.dialog-content {
				@apply mt-3 text-center w-full;

				@screen sm {
					@apply mt-0 ml-4 text-left;
				}
				
				@screen lg {
					@apply ml-0;
				}
			}
		}

		&-footer {
			@apply bg-gray-100 px-4 py-3;

			@screen sm {
				@apply px-6 flex flex-row-reverse;
			}
		}
	}
}
</style>