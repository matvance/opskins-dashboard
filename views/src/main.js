const socket = io();

function listOwnItems (items) {
	$("ul.items-list").html("");
	items.forEach((item) => {
		const html = 
		"<li class='item'>" +
			"<p class='name'>"+ item.name +"</p>" +
			"<p>id: <span class='id'>"+ item.id +"</span></p>" +
			"<p class='image'><img src='https://steamcommunity-a.opskins.media/economy/image/"+ item.img +"'/></p>" +
			"<p class='price-label'>price (in cents): <input value='"+ item.price +"'/>" +
				"<button class='save-btn'>save</button>" +
			"</p>" +
		"</li>";
		$("ul.items-list").append(html);
	})
}
function listFriendItems (items) {
	$("ul.items-list").html("");
	items.forEach((item) => {
		const html = 
		"<li class='item'>" +
			"<p><input type='checkbox' name='items-check' class='checkbox'/></p>" +
			"<p class='name'>"+ item.name +"</p>" +
			"<p>id: <span class='id'>"+ item.id +"</span></p>" +
			"<p class='image'><img src='https://steamcommunity-a.opskins.media/economy/image/"+ item.img +"'/></p>" +
			"<p class='price-label'>price:<span class='price'>"+ item.price +"</span> cents</p>" +
			"<p class='buttons'><button class='buy-item-btn'>buy it</button></p>" +
			"<p>or quick buy this item:</p>" +
			"<p>price (in cents): <input type='text' value='"+ item.price +"'/> <button class='quick-buy-btn'>quick buy</button></p>" +
		"</li>";
		$("ul.items-list").append(html);
	})
}

$(document).on("click", ".save-btn", (e) => {
	const itemId = $(e.target).parent().parent().find(".id").text();
	console.log(itemId);
	changeItemPrice(itemId, $(e.target).parent().parent().find(".price-label input").val());
})

socket.on("res items", (items) => {
	listOwnItems(items)
})
socket.on("res friend items", (items) => {
	listFriendItems(items)
})


$(() => {
	socket.emit("get account-info", (steamID, balance) => {
		$("header .steam-id").text(steamID);
		const balanceString = "$" + (balance / 100).toString();
		$("header .balance").text(balanceString);
	})
})