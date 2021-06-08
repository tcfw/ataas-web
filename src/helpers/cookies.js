export default {
	get() {
		var cookies = {};

		document.cookie.split(";").forEach(cookie => {
			let parts = cookie.trim().split("=");
			cookies[parts[0]] = parts[1];
		});

		return cookies;
	}
};