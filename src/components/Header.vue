<template>
	<div id="header" :class="headerClass">
		<router-link to="/"><h3>Ataas</h3></router-link>
	</div>
</template>
<script>
export default {
	name: "Header",
	computed: {
		headerClass() {
			let classes = []

			if (this.$route.name == 'login') {
				classes.push("nobg")
			}

			return classes;
		}
	}
}
</script>