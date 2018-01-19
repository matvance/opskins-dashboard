class SalesList {
	constructor (apiKey) {
		this.loading = true;
		this.fetch(apiKey, () => {
			this.listSales(apiKey);
		});
		this.apiKey = apiKey;
	}
	fetch (fetchApi, callback) {
		this._loading = true;
		socket.emit("request-sales", fetchApi, (sales) => {
			this._sales = sales;
			callback();
			this.loading = false;
		})
	}
	listSales (apiKey) {
		$(".sales .list").html("");
		this._sales.forEach((sale) => {
			let saleElement = "";
			let formattedPrice = "$" + (sale.price / 100)
			saleElement = 
			'<div class="item sale">' +
				'<div class="right floated content">' +
					'<div class="ui fitted checkbox">' +
						'<input type="checkbox">' +
						'<label> </label>' +
					'</div>' +
				'</div>' +
				'<div class="ui image">' +
					'<img src="https://steamcommunity-a.opskins.media/economy/image/'+ sale.img +'"/>' +
				'</div>' +
				'<div class="content">' +
					'<h3 class="name">'+ sale.name +
						'<span class="id">#' + sale.id + '</span>' +
					'</h3>';

		if (apiKey == "own") {
			saleElement += 
					'<span class="own price">'+ formattedPrice +'</span>' +
					'<div class="ui button disabled price-save-btn">Save</div>' +
					'<div class="ui button return-btn">Return</div>' +
				'</div>';
		} else {
			saleElement += 
					'<span class="price">'+ formattedPrice +'</span>' +
					'<div class="ui button buy-btn">Buy</div>' +
					'<div class="ui basic button advanced-buy-btn">Advanced Buy</div>' +
				'</div>';
		}
			

			$(".sales .list").append(saleElement);
		})
		this.loading = false;
	}
	buyItems (saleIds, totalPrice) {
		this.segmentLoader = true;
		socket.emit("buy", saleIds, totalPrice, (notification) => {
			new Notification(notification).hideAfter(6000);
			if (notification.state == "success") {
				account.fetchBalance();
				this.segmentLoader = false;
				this.hideItems(saleIds);
			}
		})
	}
	advancedBuy (saleId, price, apiKey) {
		this.loading = true;
		socket.emit("advanced-buy", saleId, price, apiKey, (notification) => {
			new Notification(notification).hideAfter(5000);
			if(notification.state == "success") {
				this.hideItems([saleId]);
			}
			this.loading = false;
		})
	}
	hideItems (saleIds) {
		saleIds.forEach((saleId) => {
			$(".sale").toArray().forEach((sale) => {
				if ($(sale).find(".id").text().replace("#", "") == saleId) {
					$(sale).fadeOut(500);
				}
			});
		});
	}
	returnItems (saleIds) {
		this.segmentLoader = true;
		socket.emit("return-items", saleIds, (notification) => {
			this.segmentLoader = false;
			new Notification(notification).hideAfter(4000);
			if (notification.state == "success") this.hideItems([saleId]);
		});
	}
	changePrice (saleId, price) {
		this.loading = true;

		socket.emit("change-price", saleId, price, (notification, relisted) => {
			new Notification(notification).hideAfter(4000);
			if (relisted) {
				sales = new SalesList("own")
			} else {
				this._sales.find(sale => sale.id == saleId).price = price;
				this.listSales("own");
			}
			this.loading = false;
		});
	}
	set loading (boolean) {
		if (boolean && !this._loading) {
			$(".sales .dimmer").addClass("active");
			$(".list-buttons .dropdown").addClass("disabled")
		} else if (!boolean) {
			$(".sales .dimmer").removeClass("active");
			$(".list-buttons .dropdown").removeClass("disabled")
		}
		this._loading = boolean;
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


	let sales = new SalesList("own");
$(() => {
	$(document).on("change", "#sales-ownership input", (e) => {
		const name = $(e.target).attr("value");
		if (name != "own") {
			sales = new SalesList(friends.getKey(name));
		} else {
			sales = new SalesList("own")
		}
	})

	$(document).on("click", ".sales .buy-btn", (e) => {
		const id = $(e.target).parent().find(".id").text().replace("#", "");
		const price = parseFloat($(e.target).parent().find(".price").text().replace("$", "")) * 100;
		sales.buyItems([id], price);
	})

	$(document).on("click", ".sale .return-btn", (e) => {
		const id = $(e.target).parent().find(".id").text().replace("#", "");
		sales.returnItem([id]);
	})

	$(document).on("click", ".own.price", (e) => {
		if (!$(e.target).hasClass("editing")) {
			const currentPrice = $(e.target).text().replace("$","");
			const inputElement = "$<input type='text' class='new-price' />"
			$(e.target).addClass("editing").html(inputElement);
			const input = $(e.target).find("input.new-price");
			input.val(currentPrice);
			input.focus();
			$(e.target).parent().parent().find(".price-save-btn").removeClass("disabled").addClass("green");

		}
	})
	$(document).on("click", ".price-save-btn", (e) => {
		const newPrice = $(e.target).parent().find(".new-price").val().replace(",", ".") * 100;
		const saleId = $(e.target).parent().parent().find(".id").text().replace("#", "");
		sales.changePrice(saleId, newPrice);
	})

	$(document).on("click", ".advanced-buy-btn", (e) => {
		const saleId = $(e.target).parent().parent().find(".id").text().replace("#", "");
		const apiKey = sales.apiKey;
		$(".advanced-buy.modal")
			.modal({
				onApprove() {
					const price = parseFloat($("input#advanced-buy-price").val().replace(",", ".")) * 100;
					sales.advancedBuy(saleId, parseInt(price), apiKey)
				}
			})
			.modal("show");
	})
})