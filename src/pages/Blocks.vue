<template>
	<div id="blocks">
		<h2>Blocks</h2>
		<div>
			<input type="checkbox" v-model="allBlocks" id="show_all_blocks" /><label for="show_all_blocks"> Show Ended Blocks</label>
		</div>
		<div id="order-blocks" v-if="blocks">
			<div v-for="block in blocks" :key="block.id" class="block" :class="{selected: selectedId == block.id}" @click="select(block)">
				<span class="flex text-left">
					<span v-if="block.instrumentInfo && block.instrumentInfo.icon" class="forex-icon" :style="{backgroundImage: 'url('+block.instrumentInfo.icon+')'} "></span>
					<span class="w-32">
						<template v-if="block.instrumentInfo">
							{{block.instrumentInfo.split}}
						</template>
						<template v-else>
							{{block.instrument}}
						</template>
					</span>
					<span class="w-32">{{currency(block.purchase)}}</span>
					<span class="label mr-2">P/L</span>
					<span class="w-1/12 pnl" :class="{profit: block.profit > 0, nil: block.profit==0}">{{currency(block.profit)}}</span>
				</span>
				<span class="flex-grow text-right">
					<template v-if="block.expires">
						<span class="label">Expires</span>
						<span class="w-28 mr-10"><countdown :until="block.expires" /></span>
					</template>
					<template v-if="block.strategy && block.state != 'ENDED'">
						<span class="label">Next action</span>
						<span class="w-24" :title="block.strategy.next"><countdown @past="handlePast" :until="block.strategy.next" /></span>
					</template>
					<span class="w-40">
						<span class="state" :class="{sold: block.state=='SOLD', nothing: block.state=='PENDING', ended: block.state=='ENDED'}">{{block.state}}</span>
					</span>
				</span>
			</div>
		</div>
		<div class="flex-grow flex flex-col" v-if="selectedId">
			<div id="info-sep"></div>
			<div>
				<div class="buysell">
					<button @click="manual('BUY')" class="buy" :disabled="selected.state != 'SOLD'">Buy</button>
					<button @click="manual('SELL')" class="sell" :disabled="selected.state !='PENDING' || selected.state != 'PURCHASED'">Sell</button>
				</div>
				<div class="flex flex-row space-x-4 items-center">
					<span v-if="selected.instrumentInfo && selected.instrumentInfo.icon" class="forex-icon lg" :style="{backgroundImage: 'url('+selected.instrumentInfo.icon+')'} "></span>
					<h2>
						<template v-if="selected.instrumentInfo">
							{{selected.instrumentInfo.foreign}}
							<small>/ {{selected.instrumentInfo.local}}</small>
						</template>
						<template v-else>
							{{selected.instrument}}
						</template>
					</h2>
					<h3 class="text-yellow-500">{{selected.market}}</h3>
				</div>
			</div>
			<div class="">
				<div class="w-1/3 inline-grid gap-5 grid-cols-1">
					<div class="panel">
						<div class="title">Strategy</div>
						<div>
							<table id="strategy-info" v-if="selected.strategy">
								<tr><th>Algo</th><td>{{formatAlgo(selected.strategy.strategy)}}</td></tr>
								<tr><th>Params</th><td>
									<table>
										<tr v-for="(v, pk) in selected.strategy.params" :key="pk">
											<th class="text-gray-400">{{pk}}</th>
											<template v-if="selected.strategy.strategy == 'JSRuntime' && pk == 'code'">
												<td class="overflow-ellipsis overflow-auto inline-block max-h-16 font-mono p-2 rounded shadow-inner bg-gray-100">
													<nl2br tag="span" :text="v"></nl2br>
												</td>
											</template>
											<template v-else>
												<td>{{v}}</td>
											</template>
										</tr>
									</table>
								</td></tr>
								<tr><th>Action Duration</th><td>Every <b>{{blockDuration(selected.strategy.duration)}}</b></td></tr>
								<tr><th>Block Size</th><td class="text-yellow-500">{{currency(selected.purchase)}}</td></tr>
							</table>
							<div v-else>Loading...</div>
						</div>
					</div>
					<div class="panel">
						<div class="title">Orders</div>
						<div style="max-height: 250px; overflow-y: auto;">
							<div v-for="order in orders" :key="order.id" class="order">
								<div class="w-14 direction" :class="{sell: order.action=='SELL'}">{{order.action ?? 'BUY'}}</div>
								<div class="w-28 overflow-ellipsis overflow-hidden">{{order.units}}</div>
								<div class="w-28">{{currency(order.price)}}</div>
								<div class="w-44">{{formatDateTime(order.timestamp)}}</div>
							</div>
						</div>
					</div>
				</div>
				<div class="w-2/3 pl-10 inline-grid gap-5 grid-cols-1">
					<div class="panel col-span-2">
						<div class="title">Profit &amp; Loss</div>
					</div>
					<div class="panel col-span-2">
						<div class="title">History</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import countdown from '../components/countdown.vue';
import _ from 'lodash';
import moment from 'moment';
import nl2br from '../helpers/nl2br';

export default {
	components: {
		countdown,
		nl2br
	},
	data() {
		return {
			timer: null,
			allBlocks: false,
			selected: null,
			selectedId: null,
			orders: {},
			routeLoaded: false,
			allowReload: false,
		}
	},
	created() {
		this.load();
		this.$store.subscribe((mutation, state) => {
			if (mutation.type == 'blocks/set') {
				setTimeout(() => {this.allowReload = true;}, 1000);

				if(
					!this.routeLoaded &&
					this.blocks != {}
				) {
					if (this.$route.params.id) {
						this.select(this.blocks[this.$route.params.id]);
					}
					this.routeLoaded = true;
				}
			}
		})
	},
	mounted() {
		this.timer = setInterval(this.refresh, 300000) //5 mins
	},
	unmounted() {
		clearInterval(this.timer)
	},
	computed: {
		blocks() {
			if (this.allBlocks) {
				return this.$store.getters['blocks/withStrategy'];
			}

			return this.$store.getters['blocks/notEndedWithStrategy'];
		},
	},
	methods: {
		instrumentInfo(block) {
			try {
				return symbols[block.market][block.instrument];
			} catch {}
			return {}
		},
		formatAlgo(v) {
			switch (v) {
				default:
				case 0:
				case "Meanlog":
					return "MEAN LOG";
				case 1:
				case "JSRuntime":
					return "JAVASCRIPT";
			}
		},
		blockDuration(v) {
			let dur = moment.duration(v / 1000000, 'milliseconds');
			let o = "";

			if (dur.hours() > 0) {
				o += " "+dur.hours()+" hour"
				if (dur.hours() > 1) {
					o+="s"
				}
			}

			if (dur.minutes() > 0) {
				o += " "+dur.minutes()+" min"
				if (dur.minutes() > 1) {
					o+="s"
				}
			}

			if (dur.seconds() > 0) {
				o += " "+dur.seconds()+" sec"
				if (dur.seconds() > 1) {
					o+="s"
				}
			}

			return o.trim();
		},
		handlePast() {
			if (!this.allowReload) return;
			setTimeout(this.refresh, 1000);
		},
		manual(action) {
			this.$http.post('/v1/blocks/'+this.selectedId+'/action/'+action).then(d => {
				this.refresh()
			}).catch(e => {
				alert(e)
			})
		},
		select(block) {
			if (this.selected == block) {
				this.selected = null;
				this.selectedId = null;
			} else {
				this.selected = block
				this.selectedId = block.id
			}

			if (this.selected) {
				this.$store.dispatch('orders/fetch', this.selectedId).then(d => {
					this.orders = _.reverse(d);
				})
			}

			this.$router.push({name: 'blocks', params:{id: this.selectedId}});
		},
		load() {
			if (this.$store.state.blocks.remoteState != "loaded") {
				this.$store.dispatch('blocks/fetch');
				this.$store.dispatch('strategies/fetch');
			}
		},
		refresh() {
			this.$store.dispatch('blocks/fetch');
			this.$store.dispatch('strategies/fetch');

			if (this.selected) {
				this.$store.dispatch('orders/fetch', this.selectedId).then(d => {
					this.orders = _.reverse(d);
				})
			}
		},
		currency(v) {
			if (!v) v = 0;
			return v.toLocaleString('en-AU', {
				style: 'currency',
				currency: 'AUD',
			})
		},
		formatDateTime(v) {
			return moment(v).format("YYYY-MM-DD HH:mm:ss");
		}
	}
}
</script>
<style lang="scss" scoped>
.panel {
	@apply rounded p-4 bg-white shadow-lg mt-4 inline-flex flex-col;

	.title {
		@apply mb-5 text-gray-500 text-sm;
	}
}

#blocks {
	@apply w-full flex flex-col;

	h2 {
		@apply text-2xl my-3;

		small {
			@apply text-gray-500;
		}
	}

	#order-blocks {
		@apply mt-5;
	}

	.forex-icon {
		@apply h-6 w-6 mr-3 align-top;
		background-position: center center;
		background-size: contain;
		background-repeat: no-repeat;

		&.lg {
			@apply h-8 w-8 -mr-1;
		}
	}

	#info-sep {
		@apply bg-white shadow-sm block h-1 -mx-10 mt-2 mb-4 overflow-hidden cursor-move select-none;
	}

	.block {
		@apply bg-white shadow my-3 py-3 px-3 rounded flex flex-row cursor-pointer;
		transition: box-shadow ease-in-out .3s;

		&.selected {
			@apply shadow-xl bg-yellow-50;
			transition: box-shadow ease-in-out .3s;
		}

		&:hover {
			@apply bg-gray-100;
		}

		.pnl {
			@apply text-red-500;

			&.profit {
				@apply text-green-500;
			}

			&.nil {
				@apply text-gray-500;
			}
		}

		span {
			@apply inline-block;

			&.market {
				@apply text-xs;
			}

			&.label {
				@apply text-xs text-gray-400 mt-1 px-0;
			}
		}

		.state {
			@apply rounded bg-green-500 text-white text-sm py-1 px-2 inline-block h-7 -mt-1;

			&.sold {
				@apply bg-yellow-500;
			}

			&.nothing {
				@apply bg-gray-500;
			}

			&.ended {
				@apply bg-red-500;
			}
		}
	}
}

.order {
	@apply flex flex-row text-sm;

	.direction {
		@apply text-green-500;

		&.sell {
			@apply text-red-500;
		}
	}
}

#strategy-info {
	@apply text-sm;

	td {
		@apply py-2 align-text-top;
	}

	th {
		@apply text-left font-normal text-gray-400 pr-5 align-text-top;
	}
}

.buysell {
	@apply float-right flex mt-1;

	.buy {
		@apply py-2 px-3 bg-green-500 text-white rounded-l-lg shadow text-sm;

		&[disabled] {
			@apply bg-green-300 shadow-none;
		}
	}
	.sell {
		@apply py-2 px-3 bg-red-500 text-white rounded-r-lg shadow text-sm;

		&[disabled] {
			@apply bg-red-200 shadow-none;
		}
	}
}
</style>