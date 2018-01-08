const socket = io();

function listOwnItems (items) {
	$("ul").innerHTML = "";
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
		$("ul").append(html);
	})
}
function listFriendItems (items) {
	$("ul").innerHTML = "";
	items.forEach((item) => {
		const html = 
		"<li class='item'>" +
			"<p><input type='checkbox' name='items-check' class='checkbox'/></p>" +
			"<p class='name'>"+ item.name +"</p>" +
			"<p class='image'><img src='https://steamcommunity-a.opskins.media/economy/image/"+ item.img +"'/></p>" +
			"<p class='price-label'>price:"+ item.price +" cents</p>" +
			"<p class='buttons'><button>buy it</button></p>" +
		"</li>";
		$("ul").append(html);
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