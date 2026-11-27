// src/content/story.ts
var o = (id, zh, jyutping, en, draw) => ({
	id,
	zh,
	jyutping,
	en,
	draw
});
var STORY_QUESTIONS = [
	{
		id: "who",
		line: {
			id: "story_q_who",
			zh: "個故事講邊個呀？",
			en: "Who is the story about?"
		},
		options: [
			o("dino", "恐龍小姐", "hung2 lung4 siu2 ze2", "Ms. Dinosaur", "Ms. Dinosaur: a friendly round green girl dinosaur with a pink bow on her head and a cream tummy, walking on two legs"),
			o("ghost", "鬼先生", "gwai2 sin1 saang1", "Mr. Ghost", "Mr. Ghost: a cute, not scary, small white floating ghost with rosy cheeks and a little blue bow tie"),
			o("shark", "鯊魚婆婆", "saa1 jyu4 po4 po2", "Grandma Shark", "Grandma Shark: a kind grey-blue shark grandma with round glasses, a lilac knitted shawl and a friendly smile (no sharp teeth showing), standing on her tail on land"),
			o("skeleton", "骷髏仔", "fu1 lou4 zai2", "Little Skeleton Boy", "Little Skeleton Boy: a cute, not scary, little skeleton boy with a big round skull, a red baseball cap and red sneakers, smiling")
		]
	},
	{
		id: "friend",
		line: {
			id: "story_q_friend",
			zh: "佢嘅好朋友係邊個呀？",
			en: "Who is their best friend?"
		},
		options: [
			o("panda", "熊貓", "hung4 maau1", "panda", "a small cuddly panda cub sitting up"),
			o("bunny", "兔仔", "tou3 zai2", "bunny", "a small white bunny with long pink-lined ears"),
			o("monkey", "馬騮", "maa5 lau1", "monkey", "a small cheeky brown monkey with a long curly tail"),
			o("penguin", "企鵝", "kei5 ngo2", "penguin", "a small round penguin with a yellow beak")
		]
	},
	{
		id: "where",
		line: {
			id: "story_q_where",
			zh: "個故事喺邊度發生呀？",
			en: "Where does the story happen?"
		},
		options: [
			o("park", "公園", "gung1 jyun2", "the park", "a sunny park with green grass, trees, a path and a bench"),
			o("restaurant", "餐廳", "caan1 teng1", "a restaurant", "a cosy restaurant with round tables, chairs and a counter"),
			o("market", "超市", "ciu1 si5", "the supermarket", "a bright supermarket aisle with shelves of fruit and a shopping trolley"),
			o("school", "學校", "hok6 haau6", "school", "a cheerful kindergarten classroom with little desks, a blackboard and toys")
		]
	},
	{
		id: "eat",
		line: {
			id: "story_q_eat",
			zh: "佢鍾意食咩呀？",
			en: "What do they like to eat?"
		},
		options: [
			o("icecream", "雪糕", "syut3 gou1", "ice cream", "one ice cream cone with a pink scoop"),
			o("eggtart", "蛋撻", "daan6 taat1", "egg tarts", "two Hong Kong egg tarts with golden yellow custard"),
			o("bun", "菠蘿包", "bo1 lo4 baau1", "pineapple buns", "a Hong Kong pineapple bun with a crackly golden top"),
			o("fishballs", "魚蛋", "jyu4 daan2", "fish balls", "a skewer of Hong Kong curry fish balls")
		]
	},
	{
		id: "play",
		line: {
			id: "story_q_play",
			zh: "佢鍾意玩咩呀？",
			en: "What do they like to play?"
		},
		show: 4,
		options: [
			o("football", "踢波", "tek3 bo1", "football", "a black-and-white football on grass"),
			o("swing", "盪韆鞦", "dong6 cin1 cau1", "on the swings", "a playground swing"),
			o("hide", "捉迷藏", "zuk1 mai4 cong4", "hide-and-seek", "a little teddy bear peeking out from behind a tree, playing hide-and-seek"),
			o("hopscotch", "跳飛機", "tiu3 fei1 gei1", "hopscotch", "a hopscotch grid drawn in chalk on the ground, with a small stone, no numbers"),
			o("kite", "放風箏", "fong3 fung1 zang1", "flying a kite", "a colourful diamond kite flying in a blue sky"),
			o("blocks", "砌積木", "cai3 zik1 muk6", "building blocks", "a little tower of colourful wooden toy blocks"),
			o("slide", "玩滑梯", "waan2 waat6 tai1", "on the slide", "a small playground slide"),
			o("rope", "跳繩", "tiu3 sing2", "skipping rope", "a skipping rope with wooden handles"),
			o("bike", "踩單車", "caai2 daan1 ce1", "riding a bike", "a child's bicycle"),
			o("draw", "畫畫", "waak6 waa2", "drawing", "crayons and a sheet of paper with a simple sun drawing"),
			o("kitchen", "玩煮飯仔", "waan2 zyu2 faan6 zai2", "play kitchen", "a toy play-kitchen stove with a tiny pot and pan"),
			o("sand", "玩沙", "waan2 saa1", "playing in the sand", "a sandpit with a little bucket, spade and a sandcastle")
		]
	},
	{
		id: "feel",
		line: {
			id: "story_q_feel",
			zh: "佢今日覺得點呀？",
			en: "How do they feel today?"
		},
		options: [
			o("happy", "開心", "hoi1 sam1", "happy", "a round yellow face, very happy, big smile"),
			o("sad", "唔開心", "m4 hoi1 sam1", "sad", "a round blue face, sad, with one small tear"),
			o("angry", "嬲", "nau1", "angry", "a round red face, cross and grumpy, puffed cheeks"),
			o("scared", "驚", "geng1", "scared", "a round light-purple face, a little scared, wide eyes, wobbly mouth")
		]
	}
];
var storyQuestion = (id) => STORY_QUESTIONS.find((q) => q.id === id);
var storyOption = (q, id) => storyQuestion(q).options.find((x) => x.id === id);
var optionImage = (q, id) => `story/${q}_${id}.jpg`;
/** Every valid set of picks has one known option per question (checked on the server too). */
function validChoices(c) {
	return STORY_QUESTIONS.every((q) => typeof c[q.id] === "string" && !!storyOption(q.id, c[q.id]));
}
// server/story.ts
var TEXT_MODEL = (env) => env.GEMINI_STORY_MODEL || "gemini-3.8-flash";
var IMAGE_MODEL = (env) => env.GEMINI_STORY_IMAGE_MODEL || "gemini-3.1-flash-image";
var API = "https://generativelanguage.googleapis.com/v1beta/models";
var pick = (c) => Object.fromEntries(STORY_QUESTIONS.map((q) => [q.id, storyOption(q.id, c[q.id])]));
function storyPrompt(c) {
	const p = pick(c);
	return `Write a very short picture-book story for a 4-year-old in a Hong Kong family who is learning Cantonese. His grandparents will listen with him.

The child chose:
- main character: ${p.who.zh} (${p.who.en}) — ${p.who.draw}
- best friend: ${p.friend.zh} (${p.friend.en})
- place: ${p.where.zh} (${p.where.en})
- favourite food: ${p.eat.zh} (${p.eat.en})
- favourite game: ${p.play.zh} (${p.play.en})
- feeling today: ${p.feel.zh} (${p.feel.en})

Rules:
- Exactly 5 pages. Each page is 1 or 2 short, simple sentences, at most 30 Chinese characters.
- Write in spoken Hong Kong Cantonese (粵語口語) with Traditional characters, the way a grandparent talks to a small child: 佢、喺、咗、嘅、啲、冇、唔、睇、行、食、玩 etc. NOT written Mandarin (no 他/她/的/在/了/沒有/看/走/吃).
- Use the chosen words exactly as written above: ${Object.values(p).map((x) => x.zh).join("、")}. Each appears at least once.
- Story shape: page 1 meets the main character at the place and says how they feel; page 2 the friend comes; page 3 they play the game; page 4 they eat the food; page 5 a warm, happy ending. If the feeling is sad, angry or scared, give a small, gentle reason and let the friend help so they feel happy by the end. Nothing frightening.
- Only easy words a 4-year-old knows. Repeat words; that's good for learning.
- "en": a plain English translation of the page, for grown-ups.
- "scene": an English description for the illustrator: who is in the picture, what they are doing, their facial expression, where they are. Name the characters as "${p.who.en}" and "the ${p.friend.en}". One moment per page. No text or signs in the picture.
- "title": a short title in Cantonese ("zh") and English ("en").`;
}
var STORY_SCHEMA = {
	type: "OBJECT",
	properties: {
		title: {
			type: "OBJECT",
			properties: {
				zh: { type: "STRING" },
				en: { type: "STRING" }
			},
			required: ["zh", "en"]
		},
		pages: {
			type: "ARRAY",
			items: {
				type: "OBJECT",
				properties: {
					zh: { type: "STRING" },
					en: { type: "STRING" },
					scene: { type: "STRING" }
				},
				required: [
					"zh",
					"en",
					"scene"
				]
			}
		}
	},
	required: ["title", "pages"]
};
async function sign(env, choices, scene) {
	const secret = env.STORY_SECRET || env.GEMINI_API_KEY || "";
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const msg = STORY_QUESTIONS.map((q) => choices[q.id]).join("|") + "\n" + scene;
	return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function writeStory(input, env) {
	const key = env.GEMINI_API_KEY;
	if (!key) return {
		status: 503,
		body: { error: "no_key" }
	};
	const choices = input?.choices;
	if (!choices || !validChoices(choices)) return {
		status: 400,
		body: { error: "bad_choices" }
	};
	for (let attempt = 1; attempt <= 2; attempt++) try {
		const r = await fetch(`${API}/${TEXT_MODEL(env)}:generateContent`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": key
			},
			body: JSON.stringify({
				contents: [{
					role: "user",
					parts: [{ text: storyPrompt(choices) }]
				}],
				generationConfig: {
					responseMimeType: "application/json",
					responseSchema: STORY_SCHEMA,
					temperature: 1
				}
			})
		});
		if (!r.ok) {
			console.error("Gemini story error", r.status, (await r.text()).slice(0, 300));
			continue;
		}
		const text = (await r.json()).candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
		const story = JSON.parse(text);
		if (!story.pages || story.pages.length < 3) continue;
		const pages = await Promise.all(story.pages.slice(0, 5).map(async (p) => ({
			zh: p.zh.trim(),
			en: p.en.trim(),
			scene: p.scene.trim(),
			sig: await sign(env, choices, p.scene.trim())
		})));
		return {
			status: 200,
			body: {
				title: story.title,
				pages
			}
		};
	} catch (e) {
		console.error("Story writing failed", e);
	}
	return {
		status: 502,
		body: { error: "story_failed" }
	};
}
var STYLE = `Warm, cute children's picture-book illustration: soft rounded shapes, gentle pastel colours,
soft brown outlines, simple flat shading, big friendly eyes, rosy cheeks. Gentle and cosy, never scary.
No text, letters, numbers, signs or speech bubbles anywhere in the image.`;
/** loadAsset reads a file the app serves (path under public/, e.g. "images/story/who_dino.jpg"). */
async function drawPage(input, env, loadAsset) {
	const key = env.GEMINI_API_KEY;
	if (!key) return {
		status: 503,
		body: { error: "no_key" }
	};
	const { choices, scene, sig } = input ?? {};
	if (!choices || !validChoices(choices) || typeof scene !== "string" || scene.length > 1200) return {
		status: 400,
		body: { error: "bad_page" }
	};
	if (sig !== await sign(env, choices, scene)) return {
		status: 403,
		body: { error: "bad_sig" }
	};
	const p = pick(choices);
	const ref = async (q) => ({ inlineData: {
		mimeType: "image/jpeg",
		data: toBase64(await loadAsset(`images/${optionImage(q, choices[q])}`))
	} });
	const parts = [
		await ref("who"),
		await ref("friend"),
		await ref("where"),
		{ text: `${STYLE}
This is one page of a picture book. Use exactly the art style of the reference images.
Image 1 is ${p.who.en} (${p.who.draw}). Image 2 is the ${p.friend.en}. Draw them looking exactly like their reference images on every page.
Image 3 shows the place: ${p.where.en}. Set the scene there, in the same look.
Draw this moment, as a full scene with a background, characters large and easy to see:
${scene}` }
	];
	for (let attempt = 1; attempt <= 3; attempt++) {
		const r = await fetch(`${API}/${IMAGE_MODEL(env)}:generateContent`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": key
			},
			body: JSON.stringify({
				contents: [{ parts }],
				generationConfig: {
					responseModalities: ["IMAGE"],
					imageConfig: { aspectRatio: "4:3" }
				}
			})
		});
		if (r.ok) {
			const img = (await r.json()).candidates?.[0]?.content?.parts?.find((x) => x.inlineData)?.inlineData;
			if (img) return {
				status: 200,
				body: {
					image: img.data,
					mimeType: img.mimeType ?? "image/png"
				}
			};
		} else {
			console.error("Gemini page error", r.status, (await r.text()).slice(0, 300));
			if (r.status < 500 && r.status !== 429) break;
		}
		await new Promise((res) => setTimeout(res, 1500 * attempt));
	}
	return {
		status: 502,
		body: { error: "draw_failed" }
	};
}
function toBase64(bytes) {
	let bin = "";
	for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode(...bytes.subarray(i, i + 32768));
	return btoa(bin);
}
// server/transcribe.ts
/**
* Words the lesson might hear, passed to Deepgram as keyterms so it listens for them.
* Always the whole set of choices (every measure word, every verb), never just the answer:
* hinting only the answer makes Deepgram "hear" it when the child says a wrong one.
* Capped so a bad request can't send Deepgram anything big.
*/
function cleanHints(hints) {
	return [...new Set(hints.map((h) => h.trim()).filter((h) => h && h.length <= 12))].slice(0, 40);
}
/** Send a short audio clip to Deepgram and return the Cantonese transcript. */
async function transcribe(audio, contentType, env, hints = []) {
	const key = env.DEEPGRAM_API_KEY;
	if (!key) return {
		status: 200,
		body: {
			transcript: null,
			error: "no_key"
		}
	};
	const params = new URLSearchParams({
		model: env.DEEPGRAM_MODEL || "nova-3",
		language: env.DEEPGRAM_LANGUAGE || "zh-HK",
		smart_format: "true",
		numerals: "true"
	});
	for (const h of cleanHints(hints)) params.append("keyterm", h);
	try {
		const r = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
			method: "POST",
			headers: {
				Authorization: `Token ${key}`,
				"Content-Type": contentType.split(";")[0]
			},
			body: audio
		});
		if (!r.ok) {
			const text = await r.text();
			console.error("Deepgram error", r.status, text);
			return {
				status: 502,
				body: {
					transcript: null,
					error: `deepgram_${r.status}`
				}
			};
		}
		const alt = (await r.json()).results?.channels?.[0]?.alternatives?.[0];
		return {
			status: 200,
			body: {
				transcript: (alt?.transcript ?? "").trim(),
				confidence: alt?.confidence
			}
		};
	} catch (e) {
		console.error("Deepgram request failed", e);
		return {
			status: 502,
			body: {
				transcript: null,
				error: "network"
			}
		};
	}
}
// server/api.ts
/**
* CantoPOP's server routes, in one place for both the Vite dev server and the GoodApp Labs
* site worker (built into cantopop-api.js by `npm run build:api`):
*   POST /cantopop/api/transcribe?hint=…   audio → Cantonese transcript (Deepgram)
*   POST /cantopop/api/story               picks → 5-page story (Gemini)
*   POST /cantopop/api/story/page          one signed page → picture (Gemini)
* loadAsset(path) returns a built file's bytes, path relative to /cantopop/ ("images/story/who_dino.jpg").
* Returns null for any other path.
*/
async function handleApi(request, env, loadAsset) {
	const url = new URL(request.url);
	const route = url.pathname.replace(/^\/cantopop\/api\//, "").replace(/\/$/, "");
	if (![
		"transcribe",
		"story",
		"story/page"
	].includes(route)) return null;
	if (request.method !== "POST") return new Response(null, { status: 405 });
	if (route === "transcribe") {
		const result = await transcribe(new Uint8Array(await request.arrayBuffer()), request.headers.get("content-type") ?? "audio/webm", env, url.searchParams.getAll("hint"));
		return Response.json(result.body, { status: result.status });
	}
	const input = await request.json().catch(() => null);
	const result = route === "story" ? await writeStory(input, env) : await drawPage(input, env, loadAsset);
	return Response.json(result.body, { status: result.status });
}
export { handleApi };
