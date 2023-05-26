import express from "express";
import handlebars from "express-handlebars";
import { realtimeProducts } from "./routes/realtime-products.routes.js";
import { __dirname } from "./utils.js";
import { Server } from "socket.io";
import { ProductManager } from "./product-manager.js";

// initializing the model
const productManager = new ProductManager("./src/productos.json");

// initializing the express server
const app = express();
const port = 8080;

// Template Engine Configuration
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// A redirect to improve UX
app.get("/", (req, res) => {
	res.redirect("/realtimeproducts");
});

// Realtime products API endpoint
app.use("/realtimeproducts", realtimeProducts);

// Only products data
app.get("/products-data", async (req, res) => {
	const products = await productManager.getProducts();
	return res.status(200).send(products);
});
// Products without websocket serving a view
app.get("/products", async (req, res) => {
	const products = await productManager.getProducts();
	return res.render("home", { products });
});

app.get("*", (req, res) => {
	res.status(404).send({ message: "Oops something went wrong ..." });
});

// Starting the server and wrapping it with a Server() for socket use
const httpServer = app.listen(port, () => {
	console.log(`Server running in http://localhost:${port}`);
});

const socketServer = new Server(httpServer);

socketServer.on("connection", (socket) => {
	socket.on("connecting_client", (data) => {
		console.log(data);
		socket.emit(
			"connecting_client",
			"Connection with the socket-server successfully"
		);
		console.log("Connection with the client established");
	});
	socket.on("new-product-data", async (product) => {
		try {
			await productManager.addProduct(product);
		} catch (error) {
			console.log(error);
		}
	});
});
