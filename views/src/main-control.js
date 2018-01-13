class Settings {
	constructor (settings) {
		if (settings) {
			this._apiKey = settings.apiKey || "";
		}
	}
	change (settings) {
		if (settings.apiKey) {
			this._apiKey = settings.apiKey;
		};
	}
}

class FriendsList {
	constructor (list) {
		if (list) {
			this._list = list;
		} else {
			this._list = [];
		}
	}
	add (friend) {
		this._list.push({
			name: friend.name,
			apiKey: friend.apiKey
		});
	}
	remove (name) {
		this._list.forEach((friend, index) => {
			if (friend.name == name) {
				this._list.splice(index, 1);
			}
		})
	}
}

let settings = new Settings();
let friends = new FriendsList();

$(() => {
	$(document).on("click", "header .settings-btn", (e) => {
		$(".ui.settings.modal")
		.modal({
			onApprove() {
				const settings = {
					apiKey: $(".ui.settings.modal input#api-key").val()
				}
				settings.change(settings)
			}
		})
		.modal("show");
	})

	$(document).on("click", "header .logs-btn", (e) => {
		$(".ui.logs.modal")
		.modal("show");
	})

	$(document).on("click", ".sidebar#friends-list .add-friend-btn", (e) => {
		$(".ui.add-friend.modal")
		.modal({
			onApprove() {
				const friend = {
					name: $(".ui.add-friend.modal input#friend-name").val(),
					apiKey: $(".ui.add-friend.modal input#friend-api").val()
				}
				friends.add(friend);
			}
		})
		.modal("show");
	})
})