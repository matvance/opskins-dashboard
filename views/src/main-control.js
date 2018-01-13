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
})

function saveSettings (settings) {
	console.log("new settings ", settings)
}