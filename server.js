require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
// const morgan = require("morgan");

const API_KEY = process.env.GEMINI_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const app = express();
const PORT = 3000;

app.use(cors());
// app.use(morgan("combined"));
app.use(express.json()); 


async function getResponse(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        const reply = data.candidates[0].content.parts[0].text || "No response received.";
        return reply;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
    }
}

async function translateHntoEN(text) {
    let res = await getResponse(`Translate the following text to English while strictly maintaining its bureaucratic tone and intended meaning: ${text}. Your response must be a single line containing only the translated text, with punctuations as needed, with no explanations, formatting, or additional commentary`);
    return res;
}

async function generateHindi() {
    let res = await getResponse("Generate a single sentence in hindi script while strictly maintaining its bureaucratic tone. Your response must be a single line containing only the translated text, with punctuations as needed, with no explanations, formatting, or additional commentary");
    return res;
}

async function contentGeneration(occ, aud, pur, imp, role, duration) {
    let res = await getResponse(`Generate well-structured, engaging, and impactful speeches or lectures tailored for various occasions. Include key points, transitions, and rhetorical devices to enhance delivery. Required info: Occasion: ${occ}; Audience: ${aud}; Purpose: ${pur}; Impact: ${imp}; Role of Speaker: ${role}; Duration: ${duration}`);
    return res;
}

app.post("/translate", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    console.log(`Translation: ${text}`);
    let gemres = await translateHntoEN(text);
    res.json({response: gemres});
    console.log("Sent!");
});

app.post("/generate", async (req, res) => {
    console.log(`Generation`);
    let gemres = await generateHindi();
    res.json({response: gemres});
    console.log("Sent!");
});

app.post("/generateSpeech", async (req, res) => {
    console.log("Generating Speech...");

    const { occasion, audience, purpose, desiredImpact, speakerRole, duration } = req.body;

    if (!occasion || !audience || !purpose || !desiredImpact || !speakerRole || !duration) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        let gemres = await contentGeneration(occasion, audience, purpose, desiredImpact, speakerRole, duration);
        res.json({ response: gemres });
        console.log("Speech Sent!");
    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

app.get("/", async(req, res) => {
    res.sendFile(`${path.join(__dirname, "index.html")}`);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
