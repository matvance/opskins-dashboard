const app = require("express")(),
	server = require("http").Server(app),
	io = require("socket.io")(server),
	jsonfile = require("jsonfile");

class Settings {
	constructor () {
		console.log("Reading settings file..");
		const settings = jsonfile.readFileSync("./settings.json");
		this._apiKey = settings.apiKey;
	}
	get apiKey () {
		return this._apiKey;
	}
	set apiKey (key) {
		if (key.length == 30) {
			this._apiKey = key.toString();
		} else {
			console.error("Error: apiKey invalid")
		}
	}
	write () {
		console.log("Writing settings file..");
		jsonfile.writeFileSync("./settings.json", {
			apiKey: this.apiKey
		}, {spaces:2});
		opskins = new OPSkinsAPI(this.apiKey);
	}
}

class FriendsList {
	constructor () {
		console.log("Reading friends-list file..")
		const list = jsonfile.readFileSync("./friends-list.json");
		this._list = list;
	}
	write () {
		console.log("Writing friends-list file..")
		jsonfile.writeFileSync("./friends-list.json", this._list, {spaces:2});
	}
	get list () {
		return this._list;
	}
	set list (newList) {
		this._list = newList
	}
}

class Notification {
	state (state) {
		this.state = state;
		return this;
	}
	title (title) {
		this.title = title;
		return this;
	}
	description (description) {
		this.description = description;
		return this;
	}
}

let settings = new Settings();
let friends = new FriendsList();

const OPSkinsAPI = require("@opskins/api"),
	SaleStatus = OPSkinsAPI.SaleStatus;
	ErrorCode = OPSkinsAPI.ErrorCode;
let opskins = new OPSkinsAPI(settings.apiKey);

// Express routes
app.set("view engine", "pug");

app.get("/", (req, res) => {
	res.render("sales");
})
app.get("/inventory", (req, res) => {
	res.render("inventory");
})

//Express start server
server.listen(80, () => {
	console.log("Application is running on localhost (127.0.0.1) port 80")
});

//Socket-io
io.on("connection", (socket) => {
	//Request Sales
	socket.on("request-sales", (fetchApi, callback) => {
		let apiGateway;
		if (fetchApi == "own") {
			apiGateway = opskins;
		} else if (fetchApi.length == 30) {
			apiGateway = new OPSkinsAPI(fetchApi);
		} else {
			throw new Error("ApiKey not provided");
		}

		apiGateway.getSales({
			type: SaleStatus.OnSale
		}, (err, totalPages, sales) => {
			if (err) {
				if (err.code == ErrorCode.NO_MATCHING_ITEMS_FOUND) callback([])
			} else {
				callback(sales);
			}
		})
	})

	//Settings
	socket.on("request-settings", (callback) => {
		callback({
			apiKey: settings.apiKey
		});
	})
	socket.on("write-settings", (newSettings) => {
		settings.apiKey = newSettings.apiKey;
		settings.write();
	})

	//Friends
	socket.on("request-friends", (callback) => {
		callback(friends.list);
	})
	socket.on("write-friends", (friendsList) => {
		friends.list = friendsList;
		console.log(friendsList);
		friends.write();
	})

	//Balance
	socket.on("request-balance", (callback) => {
		opskins.getBalance((err, balance) => {
			if (err) throw err
			callback(balance);
		})
	})

	//Inventory
	socket.on("request-inventory", (apiKey, callback) => {
		let apiGateway;
		if (!apiKey || apiKey == "own") {
			apiGateway = opskins;
		} else {
			apiGateway = new OPSkinsAPI(apiKey);
		}

		apiGateway.getInventory((err, data) => {
			if (err) throw err;
			callback(data.items);
		})
	})

	//Buy
	socket.on("buy", (saleIds, totalPrice, callback) => {
		const startTime = new Date().getTime();
		opskins.buyItems(saleIds, totalPrice, (err, items) => {
			if (err) {

				const notification = new Notification()
					.state("fail")
					.title("Failed purchasing item(s)")
					.description(err.message);

				callback(notification);
			}else {
				const endTime = new Date().getTime();
				const queryTime = endTime - startTime;

				const notification = new Notification()
					.state("success")
					.title("Item(s) purchased successfully")
					.description("Item(s) purchased successfully within " + (queryTime / 1000) + "s");

				callback(notification);
			}
		})
	})

	//Change price
	socket.on("change-price", (saleId, price, callback) => {
		const startTime = new Date().getTime();
		opskins.editPrice(saleId, price, (err, relisted) => {
			if (err) {

				const notification = new Notification()
					.state("fail")
					.title("Failed changing item price")
					.description(err.message);

				callback(notification, relisted);
			}else {
				const endTime = new Date().getTime();
				const queryTime = endTime - startTime;

				const notification = new Notification()
					.state("success")
					.title("Item price changed successfully")
					.description("Item price changed successfully within " + (queryTime / 1000) + "s");

				callback(notification, relisted);
			}
		})
	})

	//List item
	socket.on("list-item", (itemId, price, callback) => {
		const startTime = new Date().getTime();
		opskins.editPrice(itemId, price, (err, relisted) => {
			if (err) {
				const notification = new Notification()
					.state("fail")
					.title("Failed listing item")
					.description(err.message);

				callback(notification);
			} else {
				const endTime = new Date().getTime();
				const queryTime = endTime - startTime;

				const notification = new Notification()
					.state("success")
					.title("Item listed successfully")
					.description("Item listed successfully within " + (queryTime / 1000) + "s");

				callback(notification);
			}
		})
	})

	//Return item
	socket.on("return-items", (saleIds, callback) => {
		const startTime = new Date().getTime();
		opskins.returnItems([saleIds], () => {
			// if (err) {
			// 	const notification = new Notification()
			// 		.state("fail")
			// 		.title("Failed returning item")
			// 		.description(err.message);

			// 	callback(notification);
			// } else {
				const endTime = new Date().getTime();
				const queryTime = endTime - startTime;

				const notification = new Notification()
					.state("success")
					.title("Item(s) returned to the steam inventory")
					.description("Item(s) returned successfully within " + (queryTime / 1000) + "s");

				callback(notification);
			// }
		})
	})
})