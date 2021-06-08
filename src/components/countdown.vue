<template>
	{{formatted}}
</template>
<script>
import moment from 'moment';

export default {
	name: "countdown",
	props: {
		until: String,
	},
	data() {
		return {
			formatted: "",
			timer: null,
			eventFired: false,
		}
	},
	mounted() {
		this.timer = setInterval(this.compute, 500);
		this.compute();
	},
	unmounted() {
		clearInterval(this.timer);
	},
	emits: ['past'],
	methods: {
		compute() {
			let t = moment(this.until);

			if (t.isBefore(moment()) && !this.eventFired) {
				this.eventFired = true;
				this.$emit('past');
			}

			this.formatted = t.fromNow();
		}
	}
}
</script>
