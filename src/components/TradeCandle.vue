<template>
	<!-- {{data}} -->
	<div class="flex flex-row space-x-2 text-sm -mt-10 ml-16">
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '1m'">1m</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '5m'">5m</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '10m'">10m</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '30m'">30m</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '1h'">1h</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '3h'">3h</div>
		<div class="text-yellow-500 cursor-pointer hover:text-yellow-400" @click="interval = '6h'">6h</div>
	</div>
	<canvas 
		ref="maincanvas"
		class="trade-chart"
		height="450"
		@mousemove="mouseMove"
		@mouseenter="showMouse = true"
		@mouseleave="hideMouse"
		@wheel.prevent="scroll"
		@mousedown="dragStart"
		@mouseup="dragEnd"
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
			xOffset: 0,
			candleWidth: 10,

			dragging: false,
			dragStartPos: 0,

			moDataPoint: null,
		}
	},
	watch: {
		exchange() {
			this.xOffset = 0;
			this.fetch()
		},
		symbol() {
			this.xOffset = 0;
			this.fetch()
		},
		interval() {
			this.fetch();
		},
		data() {
			this.draw()
		},
		candleWidth(v) {
			this.$store.state.user_settings.trades.candleWidth;
			this.$store.commit('user_settings/set', {trades: {candleWidth: this.candleWidth}})
		},
	},
	created() {
		this.fetch()
		this.timer = setInterval(this.fetch, 30000)
		this.candleWidth = this.$store.state.user_settings.trades.candleWidth;
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
				depth: 200,
			}
			this.$http.get('/v1/history/candle', {params: req}).then(d => {
				this.data = d.data.data
			}).catch(e => {
				alert(e)
			})
		},
		scroll(e) {
			this.candleWidth += e.deltaY
			if (this.candleWidth <= 4) {
				this.candleWidth = 4;
			} else if (this.candleWidth >= 100) {
				this.candleWidth = 100;
			}
			this.draw()
		},
		dragStart(e) {
			this.dragStartPos = e.offsetX
			this.dragging = true
		},
		dragEnd(e) {
			this.dragging = false
		},
		mouseMove(e) {
			this.mouseX = e.offsetX
			this.mouseY = e.offsetY

			if (this.dragging) {
				this.xOffset += this.mouseX - this.dragStartPos
				this.dragStartPos = this.mouseX

				if (this.xOffset <= -200) {
					this.xOffset = -200
				}
			}

			this.draw()
		},
		hideMouse(e) {
			this.showMouse = false
			this.draw()
		},
		draw() {
			let minmax = this.Yminmax()
			let dims = this.canvDims()

			this.moDataPoint = null

			this.$refs.maincanvas.width = dims.width

			const ctx = this.$refs.maincanvas.getContext('2d');
			ctx.clearRect(0,0, dims.height, dims.width)

			for (var i = 1; i < 10; i++) {
				this.drawBaseLine(ctx, dims, Math.ceil(dims.height/10), i)
			}

			const d = _.reverse(_.sortBy(this.data, 'timestamp'))
			d.forEach((ohlc,i) => {
				this.drawCandle(ctx, dims, minmax, this.candleWidth, ohlc, i)
			})

			this.drawYLabels(ctx, dims, minmax)

			if (this.showMouse) {
				this.drawCursor(ctx, dims)
			}

			if (this.moDataPoint) {
				this.drawmodp(ctx, dims)
			}
		},
		drawmodp(ctx, dims) {
			ctx.font = "normal 13px Ubuntu,Helvetica,Arial,sans-serif";
			ctx.fillStyle = '#334';
			const ohlc = this.moDataPoint.ohlc;
			const x = this.moDataPoint.x
			const y = this.moDataPoint.y - 80
			ctx.fillText(`Open: ${ohlc.open}`, x, y + 10)
			ctx.fillText(`High: ${ohlc.high}`, x, y + 25)
			ctx.fillText(`Low: ${ohlc.low}`, x, y + 40)
			ctx.fillText(`Close: ${ohlc.close}`, x, y + 55)
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
			let step = (minmax.max-minmax.min)/9;

			while(i<10) {
				ctx.font = "normal 13px Ubuntu,Helvetica,Arial,sans-serif";
				ctx.fillStyle = '#9999A1';
				ctx.fillText(a.toFixed(4), dims.width - 110, (dims.height/10)*i + 3)
				a-=step
				i++
			}
		},
		drawCursor(ctx, dims) {
			const pad = 20
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'

			//Vert
			if (this.mouseX <= dims.width-120) {
				ctx.beginPath()
				ctx.setLineDash([10, 5])
				// ctx.lineWith = 1;
				const vx = Math.min(dims.width-120, Math.ceil(this.mouseX))
				ctx.moveTo(vx, pad)
				ctx.lineTo(vx, dims.height-pad)
				ctx.closePath()
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
				ctx.closePath()
				ctx.stroke()
			}

		},
		drawBaseLine(ctx, dims, scale, n) {
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
			ctx.beginPath()
			ctx.moveTo(10, Math.floor(scale * n))
			ctx.lineTo(dims.width - 120, Math.floor(scale * n))
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
			const tpad = 22

			//Line H-L
			ctx.beginPath()
			const x = Math.floor(dims.width - rpad - (nth * widthScale + nth*rpad) - 120) + this.xOffset

			if (x < 20 || x >= (dims.width - 120)) return;

			const y1 = Math.floor(tpad + (1-((ohlc.high-minmax.min)/(minmax.max-minmax.min))) * dims.height)
			const y2 = Math.floor(y1 + (((ohlc.high-ohlc.low)/(minmax.max-minmax.min))) * dims.height)+2
			ctx.moveTo(x, y1)
			ctx.lineTo(x, y2)
			ctx.closePath()
			ctx.stroke()

			//Bar O-C
			const oy1 = Math.floor(tpad + (1-((ohlc.open-minmax.min)/(minmax.max-minmax.min))) * dims.height)
			const oy2 = Math.floor((1-((ohlc.close-minmax.min)/(minmax.max-minmax.min))) * dims.height - oy1 + tpad)+2
			const ox = Math.floor(x-(widthScale/2))
			const ox1 = Math.floor(widthScale)
			ctx.fillRect(ox, oy1, ox1, oy2)

			//Set cursor point data
			if (this.mouseX <= x+(widthScale/2) && this.mouseX >= x-(widthScale/2)) {
				this.moDataPoint = {ohlc, x, y: Math.min(y1,y2)}
			}

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