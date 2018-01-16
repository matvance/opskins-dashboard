const socket = io();

class Account {
	constructor () {
		this.fetchBalance();
	}
	fetchBalance () {
		socket.emit("request-balance", (balance) => {
			this.balance = balance;
			$(".account-balance").text("$" + balance/100);
		})
	}
}

class Settings {
	constructor (settings) {
		if (settings) {
			this._apiKey = settings.apiKey || "";
		} else {
			socket.emit("request-settings", (settings) => {
				this._apiKey = settings.apiKey
				this.fillSettingsForm();
			});
		}
	}
	change (settings) {
		if (settings.apiKey) {
			this._apiKey = settings.apiKey;
			this.write();
			location.reload();
		};
	}
	fillSettingsForm () {
		$("#api-key").val(this._apiKey);
	}
	write () {
		socket.emit("write-settings", {
			apiKey: this._apiKey
		})
	}
}

class FriendsList {
	constructor (friends) {
		if (friends) {
			this._list = friends;
		} else {
			socket.emit("request-friends", (friends) => {
				this._list = friends;
				this.listFriends();
			})
		}
	}
	add (friend) {
		this._list.push({
			name: friend.name,
			apiKey: friend.apiKey
		});
		this.listFriends();
		this.write();
		location.reload();
	}
	remove (name) {
		this._list = this._list
			.filter(friend => friend.name != name);

		console.log(this._list);
		this.write();
		this.listFriends();
	}
	listFriends () {
		if (this._list) {
			$(".sidebar#friends-list table tbody").html("");
			this._list.forEach((friend) => {
				let friendElement = '<tr>' +
					'<td class="three wide nick">'+ friend.name + '</td>' +
					'<td class="key">' + (friend.apiKey.slice(0, 8) + "..") + '</td>'+
					'<td class="right aligned">' +
						'<div class="ui small basic negative button remove-friend-btn">Remove</div>' +
					'</td>';
				$(".sidebar#friends-list table tbody").append(friendElement);
			})
		} else {
			$(".sidebar#friends-list table tbody").html("No friends saved yet");
		}

		this.listInSales();
		this.listInInventory();
		this.listOnQuicksell();
	}
	// ============================= SO MANY REPEATS ==================
	listInSales () {
		const defaultMenuContent = 
			'<div class="item" data-value="own">' +
				'<strong>Your</strong> sales' +
			'</div>';

		$("#sales-ownership .menu").html(defaultMenuContent);

		this._list.forEach((friend) => {
			let friendElement = 
				'<div class="item" data-value="'+ friend.name +'">' +
					'<strong>'+ friend.name +'</strong> sales' +
				'</div>';
			$("#sales-ownership .menu").append(friendElement);
		})
	}
	listInInventory () {
		const defaultMenuContent = 
			'<div class="item" data-value="own">' +
				'<strong>Your</strong> Inventory' +
			'</div>';

		$("#inventory-ownership .menu").html(defaultMenuContent);

		this._list.forEach((friend) => {
			let friendElement = 
				'<div class="item" data-value="'+ friend.name +'">' +
					'<strong>'+ friend.name +'</strong> inventory' +
				'</div>';
			$("#inventory-ownership .menu").append(friendElement);
		})
	}
	listOnQuicksell () {
		$("#quicksell-friends .menu").html("");
		this._list.forEach((friend) => {
			let friendElement = 
				'<div class="item" data-value="'+ friend.name +'">' +
					friend.name +
				'</div>';
			$("#quicksell-friends .menu").append(friendElement);
		})
	}
	write () {
		socket.emit("write-friends", this._list);
	}
	getKey (friendName) {
		return this._list.filter((friend) => friend.name == friendName)[0]
			.apiKey;
	}
}

class Notification {
	constructor (notification) {
		this.state = notification.state;
		this.title = notification.title;
		this.description = notification.description;

		let messageClass = "";
		if (this.state == "success") {
			messageClass = "positive";
		} else if (this.state == "fail") {
			messageClass = "negative";
		}

		let notificationElement = 
		'<div class="ui '+ messageClass +' message">' +
			'<i class="close icon"></i>' +
			'<div class="header">'+ this.title +'</div>' +
			'<p>'+ this.description +'</p>' +
		'</div>';

		$(".notifications").prepend(notificationElement);
		this.htmlElement = $(".notifications .message:first-child");
		$(this.htmlElement).fadeIn(1000);
	}
	hideAfter (time) {
		setTimeout(() => {
			$(this.htmlElement).fadeOut(1000);
		}, time)
	}
}

let settings = new Settings();
let friends = new FriendsList();
let account = new Account();

$(() => {
	//Settings
	$(document).on("click", "header .settings-btn", (e) => {
		$(".ui.settings.modal")
		.modal({
			onApprove() {
				const newSettings = {
					apiKey: $(".ui.settings.modal input#api-key").val()
				}
				settings.change(newSettings)
			}
		})
		.modal("show");
	})

	//Logs
	$(document).on("click", "header .logs-btn", (e) => {
		$(".ui.logs.modal")
		.modal("show");
	})

	//Add friend
	$(document).on("click", "#friends-list .add-friend-btn", (e) => {
		$(".ui.add-friend.modal")
		.modal({
			onApprove() {
				const friend = {
					name: $(".ui.add-friend.modal input#friend-name").val(),
					apiKey: $(".ui.add-friend.modal input#friend-api").val()
				}
				friends.add(friend);
				$(".add-friend.modal input").val("");
			}
		})
		.modal("show");
	})

	//Remove friend
	$(document).on("click", "#friends-list .remove-friend-btn", (e) => {
		const friendName = $(e.target)
			.parent().parent()
			.find(".nick").text();

		friends.remove(friendName);
	})
})