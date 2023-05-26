import fs from "fs";
import { v4 } from "uuid";

export class ProductManager {
	#products;
	#path;
	constructor(aPath) {
		this.#products = [];
		this.productsWereModified = true; // With this flag now i know when a resource is updated or not. Now i can cache products if they are not modified and return in memory products instead the persisted ones in the products.json file
		this.#path = aPath;
		// In this point i must initialize the file to avoid problems... by the way i put some validations about this
		if (!fs.existsSync(this.#path)) {
			fs.writeFileSync(this.#path, "[]");
		}
	}
	async addProduct(aProduct) {
		// Validate the input data

		if (!aProduct.title) {
			throw new Error("Title field invalid");
		}
		if (!aProduct.description) {
			throw new Error("Description field invalid");
		}
		if (!aProduct.price) {
			throw new Error("Price field invalid");
		}
		if (!aProduct.code) {
			throw new Error("Code field invalid");
		}
		if (!aProduct.stock) {
			throw new Error("Stock field invalid");
		}

		// If there isnt a file were store then one is created
		if (!fs.existsSync(this.#path)) {
			await fs.promises.writeFile(this.#path, "[]");
		}

		// Check if a product with the same code exists
		const product = JSON.parse(
			await fs.promises.readFile(this.#path, "utf-8")
		).find((product) => product.code === aProduct.code);

		// If a product is found with the same code that means that exists a product with the same code... then an Error is raised
		if (product) {
			throw new Error("There is a product with the same code");
		}

		let id = v4();

		const productToStore = { ...aProduct, id: id };

		let productsStored = JSON.parse(
			await fs.promises.readFile(this.#path, "utf-8")
		);
		productsStored.push(productToStore);
		await fs.promises.writeFile(this.#path, JSON.stringify(productsStored));
		this.productsWereModified = true;
		return id;
	}
	async getProducts() {
		if (this.productsWereModified == false) {
			return this.#products;
		}

		if (!fs.existsSync(this.#path)) {
			throw new Error("File were products are stored doesnt exists");
		}
		let products = JSON.parse(fs.readFileSync(this.#path, "utf-8"));
		this.#products = products; // Cache the new ones readed
		return products;
	}
	async getProductById(anId) {
		let product = undefined;
		if (this.productsWereModified == false) {
			product = this.#products.find((product) => product.id.includes(anId));
			if (!product) throw new Error("Product doesnt exists");
			return product;
		}

		if (!fs.existsSync(this.#path)) {
			throw new Error("There isnt exists the file were products are stored");
		}
		let products = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));

		product = products.find((product) => product.id.includes(anId));
		if (!product) throw new Error("Product doesnt exists");

		this.#products = products; // Cache the new ones readed
		this.productsWereModified = false;
		return product;
	}
	async updateProduct(anId, productUpdated) {
		if (!fs.existsSync(this.#path)) {
			throw new Error("There isnt exists the file were products are stored");
		}

		// First obtein the product
		let products = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
		let product = products.find((product) => product.id.includes(anId));

		// Second update it
		product = { ...product, ...productUpdated };

		// Third delete the old product, so, we remove it from products

		products = products.filter((product) => !product.id.includes(anId));
		// Four store it
		products.push(product);
		await fs.promises.writeFile(this.#path, JSON.stringify(products));

		this.productsWereModified = true;

		return product;
	}
	async deleteProduct(anId) {
		if (!fs.existsSync(this.#path)) {
			throw new Error("There isnt exists the file were products are stored");
		}

		let products = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));

		let productToDelete = products.find((product) => product.id.includes(anId));

		if (!productToDelete) {
			throw new Error(
				`Cannot delete a product. Doesnt exists a product with id ${anId}`
			);
		}
		products = products.filter((product) => !product.id.includes(anId));
		await fs.promises.writeFile(this.#path, JSON.stringify(products));

		this.productsWereModified = true;
		return anId;
	}
	existsProductWithID(aProductID) {
		let result;

		if (this.productsWereModified) {
			let products = fs.readFileSync(this.#path, "utf-8");
			result = products.some((product) => product.id.includes(aProductID));

			this.#products = products;
			this.productsWereModified = false;
		} else {
			result = this.#products.some((product) =>
				product.id.includes(aProductID)
			);
		}
		if (!result) throw new Error("Search of product by id result in undefined");
		return result;
	}
}
