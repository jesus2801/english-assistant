import { getBrowser } from "./index";

export const englishService = async (word: string) => {
	const browser = await getBrowser();
	const page = await browser.newPage();

	await page.goto(`https://sentence.yourdictionary.com/${word}`, {
		waitUntil: "domcontentloaded",
	});

	const result = await page.evaluate(() => {
		const elements = document.body.querySelectorAll(".sentence-item__text");
		const phrases = [];

		for (let i = 0, n = elements.length; i < n; i++) {
			const phrase = (elements[i] as HTMLSpanElement).innerHTML;
			if (phrase !== "") phrases.push(phrase);
		}
		return phrases;
	});

	//DESCARGAR AUDIO
	let audioUrl = `https://ssl.gstatic.com/dictionary/static/pronunciation/2021-06-17/audio/${word.substr(
		0,
		2
	)}/${encodeURIComponent(word)}_en_us_1.mp3`;

	const audioResponse = await page.goto(audioUrl, {
		waitUntil: "domcontentloaded",
	});

	if (audioResponse.status() === 404)
		audioUrl = `https://dictionary.cambridge.org/es-LA/pronunciation/english/${encodeURIComponent(
			word
		)}`;

	await page.goto("https://tophonetics.com/", {
		waitUntil: "domcontentloaded",
	});

	await page.type("#text_to_transcribe", word);
	await page.click("#submit");
	await page.waitForSelector(".transcribed_word");

	const ipa = await page.evaluate(() => {
		const elements = document.querySelectorAll(".transcribed_word");

		let result = "";
		for (let i = 0, n = elements.length; i < n; i++) {
			result += " " + (elements[i] as HTMLSpanElement).innerText;
		}

		return result.trim();
	});

	page.close();

	return {
		phrases: result,
		audioUrl,
		ipa,
	};
};

export const frenchService = async (word: string) => {
	const browser = await getBrowser();
	const page = await browser.newPage();

	await page.goto(
		`https://www.collinsdictionary.com/dictionary/french-english/${word}`,
		{
			waitUntil: "domcontentloaded",
		}
	);

	const phrases = await page.evaluate((word) => {
		const elements = document.querySelectorAll("div.cit.type-example.cit");
		const sentences = [];

		for (let i = 0, n = elements.length; i < n; i++) {
			const sentence = (
				(elements[i] as HTMLDivElement).querySelector(
					".quote"
				) as HTMLSpanElement
			).innerText;
			if (sentence !== "")
				sentences.push(
					sentence.replace(new RegExp(word, "g"), `<mark>${word}</mark>`)
				);
		}

		return sentences;
	}, word);

	let audioUrl = `https://ssl.gstatic.com/dictionary/static/pronunciation/2021-06-17/audio/${word.substr(
		0,
		2
	)}/${encodeURIComponent(word)}_fr_fr_1.mp3`;

	const audioResponse = await page.goto(audioUrl, {
		waitUntil: "domcontentloaded",
	});

	if (audioResponse.status() === 404) audioUrl = "#";

	await page.goto("https://www.openipa.org/transcription/french", {
		waitUntil: "domcontentloaded",
	});

	await page.waitForSelector('.TextInput_input--light__15zsS')	
	await page.type(".TextInput_input--light__15zsS", word);

	let ipa;

	try {
		await page.waitForSelector(".ResultDisplay_phoneme-block__37wPO");
		ipa = await page.evaluate(() => {
			const elements = document.querySelectorAll(
				".ResultDisplay_phoneme-block__37wPO"
			);

			let result = "";
			for (let i = 0, n = elements.length; i < n; i++) {
				const spans = elements[i].querySelectorAll(
					".ResultDisplay_display-ipa--light__2N9_P"
				);
				let completeWord = "";

				for (let j = 0, k = spans.length; j < k; j++)
					completeWord += (spans[j] as HTMLSpanElement).innerText;

				result += " " + completeWord;
			}

			return result.trim();
		});
	} catch (e) {
		ipa = "CAMBIATE LA IP AMIGO";
	}

	page.close();

	return {
		phrases,
		audioUrl,
		ipa,
	};
};
