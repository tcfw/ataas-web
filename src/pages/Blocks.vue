<template>
	<div id="blocks">
		<div class="flex flex-row">
			<h2 class="pageheader">Blocks</h2>
			<button id="add" @click="showAddDialog">
				<Plus/>
			</button>
			<switcher v-model="allBlocks" class="mt-3 ml-4">
				Show Ended Blocks
			</switcher>
		</div>
		<div id="order-blocks" v-if="Object.keys(blocks).length > 0">
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
						<span class="state" :class="{sold: block.state=='SOLD', nothing: block.state=='PENDING', ended: block.state=='ENDED'}">{{block.state || 'PENDING'}}</span>
					</span>
				</span>
			</div>
		</div>
		<div v-else class="recommend_addnew">
				<CryptoFlower/>
				<div>Add a new block by clicking the '+' button</div>
		</div>
		<div class="flex-grow flex flex-col" v-if="selectedId">
			<div id="info-sep"></div>
			<div>
				<div class="buysell">
					<button @click="manual('BUY')" class="buy" :disabled="selected.state != 'SOLD'">Buy</button>
					<button @click="manual('SELL')" class="sell" :disabled="selected.state !='PENDING' && selected.state != 'PURCHASED'">Sell</button>
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
								<tr><th>Action Schedule</th><td>Every <b>{{blockDuration(selected.strategy.duration)}}</b></td></tr>
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
						<TradeCandle :exchange="selected.market" :symbol="selected.instrument" />
					</div>
				</div>
			</div>
		</div>
	</div>
	<Dialog :visible="showAdd" @bgClick="showAdd = !showAdd">
		<template v-slot:header>Add New Block</template>
		<template v-slot:body>
			<BlockForm ref="bform" />
		</template>
		<template v-slot:footer>
			<button class="ml-4 btn primary sm" @click="addBlock">Add</button>
			<button class="btn sm" @click="showAdd = !showAdd">Cancel</button>
		</template>
	</Dialog>
</template>
<script>
import _ from 'lodash';
import countdown from '../components/countdown.vue';
import CryptoFlower from '../icons/undraw_Crypto_flowers.vue';
import Dialog from '../components/Dialog.vue';
import moment from 'moment';
import nl2br from '../helpers/nl2br';
import Plus from '../icons/plus.vue';
import switcher from '../components/switcher.vue';
import Times from '../icons/times.vue';
import BlockForm from '../components/BlockForm.vue';
import TradeCandle from '../components/TradeCandle.vue';

export default {
	components: {
		countdown,
		CryptoFlower,
		Dialog,
		nl2br,
		Plus,
		Times,
		switcher,
		BlockForm,
		TradeCandle,
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
			showAdd: false,
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
					if (this.id || this.$route.params.id) {
						this.select(this.blocks[this.$route.params.id], true);
					}
					this.routeLoaded = true;
				}
			}
		})

		this.$watch(
			() => this.$route.params,
			(toParams) => {
				if (toParams.id==null) {
					this.select(null, true)
				}
			}
		)
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
		select(block, skipRoute) {
			if (this.selected == block || block == null) {
				this.selected = null;
				this.selectedId = null;
				if (!skipRoute) this.$router.push({name: 'blocks'});

				return
			} else {
				this.selected = block
				this.selectedId = block.id
			}

			if (this.selected) {
				this.$store.dispatch('orders/fetch', this.selectedId).then(d => {
					this.orders = _.reverse(d);
				})
			}

			if (!skipRoute) {
				this.$router.push({name: 'blocks', params:{id: this.selectedId}});
			}
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
		},
		showAddDialog() {
			//TODO(tcfw): reset
			this.showAdd = true;
		},
		addBlock() {
			this.$refs.bform.submit()
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

button#add {
	@apply flex items-center justify-items-center rounded-full shadow bg-gray-700 text-yellow-500 h-12 w-12 ml-3 mt-1 outline-none;
	transition: box-shadow .3s ease-in-out, background-color .3s ease-in-out;

	svg {
		@apply self-center flex-grow;
	}

	&:hover {
		@apply shadow-lg bg-gray-600;
	}

	&:active {
		@apply shadow-none bg-gray-800;
	}
}

#blocks {
	@apply w-full flex flex-col;

	#order-blocks {
		@apply mt-5 overflow-auto;
		min-height: 225px;
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

		&:hover {
			@apply bg-blue-400;
		}

		&:active {
			@apply bg-yellow-400;
		}
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
		@apply py-2 px-3 bg-green-500 text-white rounded-l-lg shadow-lg text-sm;

		&[disabled] {
			@apply bg-green-300 shadow-none;
		}
	}
	.sell {
		@apply py-2 px-3 bg-red-500 text-white rounded-r-lg shadow-lg text-sm;

		&[disabled] {
			@apply bg-red-200 shadow-none;
		}
	}
}
</style>