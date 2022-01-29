import puppeteer, { Browser } from "puppeteer";
import express, { urlencoded, json } from "express";
import cors from "cors";
import {englishService, frenchService} from "./services";

const app = express();
const port = 3001;
let mainBrowser: undefined | Browser;

app.use(cors());
app.use(json());
app.use(urlencoded());

export const getBrowser = async () =>
	mainBrowser ? mainBrowser : await puppeteer.launch();

app.get("/:word/:language", async (req, res) => {
	const { word, language } = req.params;

	const response = language === 'en' ? await englishService(word) : await frenchService(word);

	res.send(response);

});

app.listen(port, () => {
	console.log("app is running on port: ", port);
});

process.on("exit", async () => {
	if (mainBrowser) await mainBrowser.close();
});
