$(() => {
	$(document).on("click", "a.show-settings-btn", (e) => {
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
})

function saveSettings (settings) {
	console.log("new settigns ", settings)
}