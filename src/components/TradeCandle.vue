<template>
	<!-- {{data}} -->
	<canvas 
		ref="maincanvas"
		class="trade-chart"
		height="450"
		@mousemove="mouseMove"
		@mouseenter="showMouse = true"
		@mouseleave="hideMouse"
	/>
</template>
<script>
import _ from 'lodash'

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
			showMouse: false,
			mouseX: 0,
			mouseY: 0,
		}
	},
	watch: {
		exchange() {
			this.fetch()
		},
		symbol() {
			this.fetch()
		},
		data() {
			this.draw()
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
		mouseMove(e) {
			this.mouseX = e.offsetX
			this.mouseY = e.offsetY
			this.draw()
		},
		hideMouse(e) {
			this.showMouse = false
			this.draw()
		},
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
		},
		draw() {
			let minmax = this.Yminmax()
			let dims = this.canvDims()

			this.$refs.maincanvas.width = dims.width

			const ctx = this.$refs.maincanvas.getContext('2d');
			ctx.clearRect(0,0, dims.height, dims.width)

			for (var i = 1; i < 10; i++) {
				this.drawBaseLine(ctx, dims, Math.ceil(dims.height/10), i)
			}

			const d = _.reverse(_.sortBy(this.data, 'timestamp'))
			d.forEach((ohlc,i) => {
				this.drawCandle(ctx, dims, minmax, 11, ohlc, i)
			})

			this.drawYLabels(ctx, dims, minmax)

			if (this.showMouse) {
				this.drawCursor(ctx, dims)
			}
		},
		Yminmax() {
			let max = _.maxBy(this.data, 'high').high
			let min = _.minBy(this.data, 'low').low

			let scale = (max-min)/3

			max+=scale
			min-=scale

			return {min, max, scale}
		},
		drawYLabels(ctx, dims, minmax) {
			let i = 1;
			let a = minmax.max;
			let step = (minmax.max-minmax.min)/8;

			while(a>=minmax.min) {
				ctx.font = "normal 13px Ubuntu,Helvetica,Arial,sans-serif";
				ctx.fillStyle = '#9999A1';
				ctx.fillText(a.toFixed(4), dims.width - 110, (dims.height/10)*i + 3)
				i++
				a-=step
			}
		},
		drawCursor(ctx, dims) {
			const pad = 20
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'

			//Vert
			if (this.mouseX <= dims.width-120) {
				ctx.beginPath()
				ctx.setLineDash([10, 5])
				ctx.lineWith = 1;
				const vx = Math.min(dims.width-120, Math.ceil(this.mouseX))
				ctx.moveTo(vx, pad)
				ctx.lineTo(vx, dims.height-pad)
				ctx.stroke()
			}

			//Hori
			if (this.mouseY >= 30 && this.mouseY <= dims.height-30) {
				ctx.beginPath()
				ctx.setLineDash([10, 5])
				ctx.lineWith = 1;
				const hy = Math.ceil(this.mouseY)
				ctx.moveTo(10, hy)
				ctx.lineTo(dims.width-120, hy)
				ctx.stroke()
			}

		},
		drawBaseLine(ctx, dims, scale, n) {
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
			ctx.beginPath()
			ctx.moveTo(10, scale * n)
			ctx.lineTo(dims.width - 120, scale * n)
			ctx.closePath()
			ctx.stroke()
		},
		drawCandle(ctx, dims, minmax, widthScale, ohlc, nth) {
			if (ohlc.close >= ohlc.open) {
				ctx.strokeStyle = 'green'
				ctx.fillStyle = 'green'
			} else {
				ctx.strokeStyle = 'red'
				ctx.fillStyle = 'red'
			}

			const rpad = 10
			const tpad = 0

			//Line H-L
			ctx.beginPath()
			const x = dims.width - rpad - (nth * widthScale + nth*rpad) - 120
			const y1 = tpad + (1-((ohlc.high-minmax.min)/(minmax.max-minmax.min))) * dims.height
			const y2 = y1 + (((ohlc.high-ohlc.low)/(minmax.max-minmax.min))) * dims.height
			ctx.moveTo(x, y1)
			ctx.lineTo(x, y2)
			ctx.closePath()
			ctx.stroke()

			//Bar O-C
			// ctx.beginPath()
			// ctx.closePath()
			// ctx.fill()
			const oy1 = tpad + (1-((ohlc.open-minmax.min)/(minmax.max-minmax.min))) * dims.height
			const oy2 = (1-((ohlc.close-minmax.min)/(minmax.max-minmax.min))) * dims.height - oy1
			const ox = x-(widthScale/2)
			const ox1 = widthScale
			ctx.fillRect(ox, oy1, ox1, oy2)
		},
		canvDims() {
			const domSize = this.$refs.maincanvas.getBoundingClientRect()
			let height=Math.floor(domSize.height)
			let width=Math.floor(domSize.width)

			return {height, width}
		}
	}
}
</script>
<style lang="scss" scoped>
.trade-chart {
	@apply w-full;
	height: 450px;
}
</style>