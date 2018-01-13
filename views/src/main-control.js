$(() => {
	$(document).on("click", "header .settings-btn", (e) => {
		$(".ui.settings.modal")
		.modal({
			onApprove() {
				const settings = {
					apiKey: $(".ui.settings.modal input#api-key").val()
				}
				saveSettings(settings)
			}
		})
		.modal("show");
	})

	$(document).on("click", "header .logs-btn", (e) => {
		$(".ui.logs.modal")
		.modal("show");
	})

	$(document).on("click", ".sidebar#friends-list .add-friend-btn", (e) => {
		$(".ui.add-friend.modal")
		.modal({
			onApprove() {
				const friend = {
					name: $(".ui.add-friend.modal input#friend-name").val(),
					apiKey: $(".ui.add-friend.modal input#friend-api").val()
				}
				addFriend(friend);
			}
		})
		.modal("show");
	})
})

function saveSettings (settings) {
	console.log("new settings ", settings)
}

function addFriend (user) {
	console.log("new friend ", user)
}