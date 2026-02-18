const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
const PORT = 3001;

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(bodyParser.json());

// API Endpoint: OCR Processing (OCR.Space)
app.post('/api/process-image', async (req, res) => {
    const { image } = req.body;

    if (!process.env.OCR_SPACE_API_KEY) {
        return res.status(500).json({ error: "OCR.Space API Key missing" });
    }

    console.log("📸 Sending image to OCR.Space...");

    try {
        const formData = new FormData();
        formData.append('base64Image', image);
        formData.append('apikey', process.env.OCR_SPACE_API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Engine 2 is better for numbers/special chars

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.IsErroredOnProcessing) {
            throw new Error(data.ErrorMessage?.[0] || "OCR Error");
        }

        const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
        console.log("✅ OCR Success. Extracted:", extractedText.substring(0, 50) + "...");

        res.json({ found: true, text: extractedText });

    } catch (error) {
        console.error("❌ OCR.Space Error:", error);
        res.status(500).json({ error: "OCR Failed", details: error.message });
    }
});

// Serve frontend static files
app.use(express.static('.'));

// Load DB
const DB_PATH = path.join(__dirname, 'data', 'master_db.json');
let masterDB = [];
try {
    if (fs.existsSync(DB_PATH)) {
        masterDB = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        console.log(`✅ Loaded ${masterDB.length} chemicals from Master DB.`);
    } else {
        console.error("❌ Master DB not found at:", DB_PATH);
    }
} catch (e) {
    console.error("❌ Failed to load Master DB:", e);
}

// Language Map
const LANG_MAP = {
    'en': 'English',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'mr': 'Marathi',
    'pa': 'Punjabi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'bn': 'Bengali',
    'or': 'Odia'
};

// API Endpoint: Analyze Text
app.post('/api/analyze', async (req, res) => {
    const { text, language = 'en' } = req.body;
    const targetLang = LANG_MAP[language] || 'English';

    console.log(`🔍 Analyzing text request (Target: ${targetLang})...`);

    if (!text) return res.status(400).json({ error: "No text provided" });

    const lowerText = text.toLowerCase();

    // Find all matches
    const matches = masterDB.filter(chem => {
        return chem.aliases.some(alias => lowerText.includes(alias.toLowerCase())) ||
            lowerText.includes(chem.name.toLowerCase());
    });

    if (matches.length > 0) {
        // Sort matches by priority (Ia > Ib > II > III)
        // Mapping: Ia=1, Ib=2, II=3, III=4, U=5
        const hazardOrder = { 'Ia': 1, 'Ib': 2, 'II': 3, 'III': 4, 'U': 5 };

        matches.sort((a, b) => {
            const hA = hazardOrder[a.hazard_class] || 99;
            const hB = hazardOrder[b.hazard_class] || 99;
            return hA - hB;
        });

        const bestMatch = matches[0];
        console.log(`✅ Found Match: ${bestMatch.name} (${bestMatch.hazard_type})`);

        console.log("✅ Match found in Master DB:", matches[0].name);
        // Note: DB is English-only for now. Ideally, we should translate this too, 
        // but for now we return DB result as is. 
        // Improvement: We could use AI to translate DB result if language != en

        return res.json({
            found: true,
            source: 'db',
            data: matches[0]
        });
    } else {
        console.log("⚠️ No match found in Master DB. Switching to Groq AI...");

        if (!process.env.GROQ_API_KEY) {
            return res.json({ found: false, error: "No Database Matches & No API Key" });
        }

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert toxicologist and agronomist. 
                        Analyze the following pesticide label text and extract safety information.
                        
                        CRITICAL INSTRUCTION: Translate all value strings to ${targetLang}.
                        The keys must remain in English (e.g. "sideEffects", "firstAid").
                        Only the values should be in ${targetLang}.

                        Return ONLY valid JSON with this structure:
                        {
                            "name": "Chemical Name (in English)",
                            "class": "Hazard Class (Ia, Ib, II, III, or U)",
                            "hazardType": "Hazard Type String (Translated to ${targetLang})",
                            "sideEffects": "Common side effects string (Translated to ${targetLang})",
                            "firstAid": "First aid instructions string (Translated to ${targetLang})",
                            "disposal": "Disposal instructions string (Translated to ${targetLang})",
                            "precautions": "Safety precautions string (Translated to ${targetLang})",
                            "dosage": { "default": 0.0, "unit": "ml/L" },
                            "crops": ["Crop1", "Crop2"]
                        }
                        If safety info is missing, infer standard safety protocols for pesticides.
                        Do not include markdown formatting like \`\`\`json. Just the raw JSON.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1
            });

            const aiResponse = completion.choices[0]?.message?.content || "{}";
            console.log("🤖 Groq Response:", aiResponse.substring(0, 50) + "...");

            // Clean cleanup json markdown if present
            const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g).trim();

            let aiData;
            try {
                aiData = JSON.parse(cleanJson);
            } catch (e) {
                console.error("JSON Parse Error on AI response");
                return res.json({ found: false, error: "AI Response Invalid JSON" });
            }

            return res.json({
                found: true,
                source: 'ai',
                data: aiData
            });

        } catch (error) {
            console.error("❌ Groq API Error:", error);
            res.json({ found: false, error: "AI Analysis Failed" });
        }
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🌾 Agri-Guard Backend Running`);
    console.log(`🌍 Server: http://localhost:${PORT}`);
    console.log(`📡 API:    http://localhost:${PORT}/api/analyze`);
    console.log(`=============================================`);
});
