const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const fs = require("fs");
let SETTINGS = require("./settings.json");
function writeSettings (callback) {
	fs.writeFileSync("./settings.json", JSON.stringify(SETTINGS, null, "\t"), "utf-8")
	if (callback) callback();
}

const OPSkinsAPI = require("@opskins/api");
const opskins = new OPSkinsAPI(SETTINGS.apiKey);
const SaleStatus = OPSkinsAPI.SaleStatus;

let savedUsers = {};

server.listen(80);

app.set("view engine", "pug");

app.get("/", (req, res) => {
	res.render("sales");
})
app.get("/buy-items", (req, res) => {
	res.render("buy-items");
})

io.on("connection", (socket) => {
	socket.on("req items", () => {
		opskins.getSales({
			type: SaleStatus.OnSale
		}, (err, totalPages, sales) => {
			if (err) console.log("error: ", err)
			socket.emit("res items", sales)
		})
	})
	socket.on("change item price", (args) => {
		opskins.editPrice(args.itemId, args.price, (err, relisted) => {
			if (err) console.log(err)
		})
	})



	socket.on("req user items", (args) => {
		if (!savedUsers[args.apiKey]) {
			savedUsers[args.apiKey] = new OPSkinsAPI(args.apiKey);
			savedUsers[args.apiKey].getSales({
				type: SaleStatus.OnSale
			}, (err, totalPages, sales) => {
				if (err) console.log(err);
				socket.emit("res friend items", sales)
			})
		} else {
			savedUsers[args.apiKey].getSales({
				type: SaleStatus.OnSale
			}, (err, totalPages, sales) => {
				if (err) console.log(err);
				socket.emit("res friend items", sales)
			})
		}
	})
	socket.on('get account-info', (callback) => {
		opskins.getSteamID((err, steamID) => {
			if (err) console.log(err);
			opskins.getBalance((err, balance) => {
				if (err) console.log(err);
				callback(steamID, balance);
			});
		});

	})

	socket.on("buy item", (saleId, price) => {
		console.log(saleId, price);
		opskins.buyItems([saleId], price, (err, items) => {
			if (err) console.log(err);
			console.log(items, " purchased.")
		})
	})
	socket.on("quick buy item", (saleId, price, sellerApi) => {
		savedUsers[sellerApi].editPrice(saleId, price, (err, relisted) => {
			if (err) console.log(err);
			opskins.buyItems([saleId], price, (err, items) => {
				if (err) console.log(err);
			})
		})
	})
})