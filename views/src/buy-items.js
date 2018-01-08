$(document).on("click", ".api-save-btn", (e) => {
	socket.emit("req user items", {
		apiKey: $(e.target).parent().find("input").val()
	})
})
$(document).on("click", ".buy-item-btn", (e) => {
	const saleId = $(e.target).parent().parent().find(".id").text();
	const price = parseInt($(e.target).parent().parent().find(".price").text());

	socket.emit("buy item", saleId, price);
})
$(document).on("click", ".quick-buy-btn", (e) => {
	const saleId = $(e.target).parent().parent().find(".id").text();
	const price = parseInt($(e.target).parent().find("input").val());
	const sellerApi = $("input.api-key").val();

	socket.emit("quick buy item", saleId, price, sellerApi);
})