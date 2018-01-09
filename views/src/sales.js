function changeItemPrice (itemId, price) {
	socket.emit("change item price", {
		itemId: itemId,
		price: price
	})
}

$(() => {
	socket.emit("req items");
})
