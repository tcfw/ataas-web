<template>
	{{data}}
</template>
<script>
export default {
	props: {
		exchange: String,
		symbol: String,
	},
	data() {
		return {
			interval: "30m",
			data: [],
			timer: null,
		}
	},
	watch: {
		exchange() {
			this.fetch()
		},
		symbol() {
			this.fetch()
		}
	},
	created() {
		this.fetch()
		this.timer = setInterval(this.fetch, 30000)
	},
	unmounted() {
		clearInterval(this.timer);
	},
	methods: {
		fetch() {
			let req = {
				market: this.exchange,
				instrument: this.symbol,
				interval: this.interval,
				depth: 50,
			}
			this.$http.get('/v1/history/candle', {params: req}).then(d => {
				this.data = d.data.data
			}).catch(e => {
				alert(e)
			})
		}
	}
}
</script>