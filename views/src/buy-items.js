$(document).on("click", ".api-save-btn", (e) => {
	socket.emit("req user items", {
		apiKey: $(e.target).parent().find("input").val()
	})
})
$(document).on("click", ".buy-item-btn", (e) => {
	// code for buying one specific item
})