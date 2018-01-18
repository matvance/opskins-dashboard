class Inventory {
	constructor (name) {
		this.loading = true;
		const apiKey = (name == "own") ? "own" : friends.getKey(name);
		socket.emit("request-inventory", apiKey, (items) => {
			this._items = items;
			this.listItems();
			this.loading = false;
		})
	}
	set loading (boolean) {
		if (boolean && !this._loading) {
			$(".inventory .dimmer").addClass("active");
			$(".inventory-controls .dropdown").addClass("disabled")
		} else if (!boolean) {
			$(".inventory .dimmer").removeClass("active");
			$(".inventory-controls #inventory-ownership").removeClass("disabled")
		}
		this._loading = boolean;
	}
	listItems () {
		const itemsContainer = $(".inventory .skins").html("");
		this._items.forEach((item) => {
			let itemElement = 
				'<div class="ui card skin">' +
					'<div class="image">' +
						'<img src="https://steamcommunity-a.opskins.media/economy/image/'+ item.img +'" />' +
					'</div>' +
					'<div class="content">' +
						'<div class="ui checkbox">' +
							'<input name="check-items" type="checkbox" />' +
							'<label>'+ item.name +'</label>' +
						'</div>' +
						'<div class="ui small green basic button sell-item-btn">Sell</div>' +
						'<div class="ui small basic button return-item-btn">Return</div>' +
					'</div>' +
					'<div class="extra">' + 
						'<p class="id">'+ item.id +'</p>' +
					'</div>' +
				'</div>';
			itemsContainer.append(itemElement);
		})
	}
	listModalItem (id) {
		const item = this._items.find((item) => item.id == id);
		let modalItemHtml = 
		'<div class="ui centered card"">' +
			'<div class="image">' +
				'<img src="https://steamcommunity-a.opskins.media/economy/image/'+ item.img +'"/>' +
			'</div>' +
			'<div class="content">' +
				'<h2>'+ item.name +'</h2>' +
			'</div>' +
			'<div class="extra">' +
				'<p class="id">'+ item.id +'</p>' +
			'</div>' +
		'</div>';

		$(".modal-item").html(modalItemHtml);
	}
	listOnMarket (item, price) {
		this.segmentLoader = true;
		socket.emit("list-item", item.id, price, (notification) => {
			this.segmentLoader = false;
			new Notification(notification).hideAfter(5000);
			new Inventory("own");
		});
	}
	set segmentLoader (boolean) {
		if (boolean && !this._segmentLoader) {
			$(".segment-loader").addClass("active");
		} else if (!boolean) {
			$(".segment-loader").removeClass("active");
		}
		this._segmentLoader = boolean;
	}
}

	let inventory = new Inventory("own");
$(() => {

	$(window).resize(windowResized);
	windowResized();

	$(document).on("click", ".show-btn", (e) => {
		const name = $("#inventory-ownership input").val();
		if (name) inventory = new Inventory(name);
	})

	$(document).on("click", ".sell-item-btn", (e) => {
		const id = $(e.target).parent().parent().find(".id").text();
		inventory.listModalItem(id);
		inventory._activeItem = inventory._items.find((item) => item.id == id);

		$(".ui.sell-item.modal")
		.modal("show");
	})

		$(document).on("click", ".list-item-btn", (e) => {
			const price = parseFloat($(".list-item-btn").parent().find(".field input").val().replace(",", ".")) * 100;
			if (price > 0) {
				inventory.listOnMarket(inventory._activeItem, price);
				$(".ui.sell-item.modal")
				.modal("hide");
			}
		})
})

function windowResized (e) {
	const windowWidth = $(window).width();
	if (windowWidth <= 1200) {
		$(".inventory .ui.cards").removeClass("four").removeClass("three").addClass("two");
	} else if (windowWidth <= 1480) {
		$(".inventory .ui.cards").removeClass("four").addClass("three");
	} else {
		$(".inventory .ui.cards").removeClass("three").addClass("four");
	}
}