import express from "express";

export const realtimeProducts = express.Router();

realtimeProducts.get("/", (req, res) => {
	return res.render("realTimeProducts", {});
});
