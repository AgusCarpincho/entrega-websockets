const socket = io();

console.log("Attempting to connect with server via websocket");

socket.emit(
	"connecting_client",
	"User client trying to connect with server via websocket ..."
);
socket.on("connecting_client", (message) => {
	console.log(message);
});

// I'll store the products here to avoid duplicate information and problems with the backend
let products = [];

function renderProductsFetched(products) {
	const realtimeProductsList = document.getElementById("realtime-products");
	for (const product of products) {
		realtimeProductsList.innerHTML += `<article id=${product.id} style="background-color: whitesmoke;margin: 2%;padding: 2%;border-radius: 0.25rem;box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px; width: 20%; height: max-content">
		<h2 style="color: rgb(3, 80, 128);">
		${product.title}
		</h3>
		<p>
		${product.description}
		</p>
		<h2 style="color: green">
			Precio ${product.price}
		</h2>
		<h3 style="color: black">
			Stock:
			${product.stock}
		</h3>
		<button onclick="deleteProductWithId('${product.id}')" style="background-color: brown; color: whitesmoke; border: none; border-radius: 0.25rem; padding: 0.5rem; width: 30%; cursor: pointer">Borrar</button>
	</article>`;
	}
	return;
}

function deleteProductWithId(anId) {
	products = products.filter((product) => product.id !== anId);
	socket.emit("delete-product-data", anId);
	location.reload();
}
async function getProductsDataAndRender() {
	await fetch("http://localhost:8080/products-data", {
		method: "GET",
	})
		.then((response) => response.json())
		.then((data) => {
			renderProductsFetched([...data]);
			products = [...data];
		})
		.catch((error) => console.log("error", error));
}

// I initialize the structure with the previously stored products
getProductsDataAndRender();

function isValidProductData(productData) {
	let validData = true;
	if (!productData.title) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita un título",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	if (!productData.description) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita una descripción",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	if (!productData.price) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita un precio",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	if (!productData.stock) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita un stock",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	if (!productData.code) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita un código",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	if (!productData.category) {
		Swal.fire({
			position: "center",
			icon: "error",
			title: "El producto no pudo ser agregado porque necesita una categoria",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	let productDuplicated = products.find(
		(product) => product.code === productData.code
	);
	if (productDuplicated) {
		Swal.fire({
			position: "center",
			icon: "error",
			title:
				"El producto no pudo ser agregado porque el código introducido lo posee otro producto",
			showConfirmButton: false,
			timer: 3000,
		});
		validData = false;
	}
	return validData;
}
function addProductToRealtimeProductsList(productData) {
	if (!isValidProductData(productData)) {
		throw new Error("Invalid product data");
	}
	const realtimeProductsList = document.getElementById("realtime-products");
	realtimeProductsList.innerHTML += `<article style="background-color: whitesmoke;margin: 2%;padding: 2%;border-radius: 0.25rem;box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px; width: 20%; height: max-content">
	<h2 style="color: rgb(3, 80, 128);">
	${productData.title}
	</h3>
	<p>
	${productData.description}
	</p>
	<h2 style="color: green">
		Precio ${productData.price}
	</h2>
	<h3 style="color: black">
		Stock:
		${productData.stock}
	</h3>
	<button onclick="deleteProductWithId('${productData.id}')" style="background-color: brown; color: whitesmoke; border: none; border-radius: 0.25rem; padding: 0.5rem; width: 30%; cursor: pointer">Borrar</button>
</article>`;
	Swal.fire({
		position: "center",
		icon: "success",
		title: "Producto agregado satisfactoriamente",
		showConfirmButton: false,
		timer: 1500,
	});
	products.push(productData);
	return;
}
// this file allows the client to establish the connection with the server
// this function is used in the form to send the data
function submitForm(event) {
	event.preventDefault();

	let productData = {
		title: event.target[0].value,
		description: event.target[1].value,
		price: event.target[2].value,
		stock: event.target[3].value,
		code: event.target[4].value,
		category: event.target[5].value,
	};

	try {
		socket.emit("new-product-data", productData);
		socket.on("new-product-id", (id) => {
			console.log(id);
			addProductToRealtimeProductsList({ ...productData, id });
		});
	} catch (error) {
		console.error(error);
	}
}
