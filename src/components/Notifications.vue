<template>
	<div class="notifications">
		<Bell class="bell"/>
		<div v-if="unreadCount>0" class="unread"></div>
	</div>
</template>
<script>
import Bell from '../icons/bell.vue';

export default {
	components: {
		Bell,
	},
	data() {
		return {
			unreadCount: 0,
		}
	}
}
</script>
<style lang="scss" scoped>
.notifications {
	@apply mr-6 relative;

	.bell {
		@apply w-auto h-6 text-gray-700 select-none;

		&:deep(.fa-primary) {
			@apply text-gray-500;
		}
	}

	.unread {
		@apply absolute top-0 right-0 bg-red-400 h-4 w-4 rounded-full border-4 border-gray-100 -mt-1 -mr-1;
		box-shadow: 0 0 0 0 rgba(248, 113, 113, 1);
		transform: scale(1);
		animation: pulse 2s infinite;
	}
}

@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.7);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(248, 113, 113, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(248, 113, 113, 0);
	}
}
</style>