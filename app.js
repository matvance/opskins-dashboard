const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const OPSkinsAPI = require("@opskins/api");
//                          \/\/\/\/
const opskins = new OPSkinsAPI("");
const SaleStatus = OPSkinsAPI.SaleStatus;

let savedUsers = {};

server.listen(80);

app.set("view engine", "pug");

app.get("/", (req, res) => {
	res.render("home");
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
})