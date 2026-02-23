const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CORS — allow localhost (dev) + Vercel (prod)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (file://, curl, Postman, same-server SSR)
        if (!origin) return callback(null, true);
        // Allow any localhost origin (local dev)
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }
        // Allow Vercel deployments (*.vercel.app or custom domains)
        if (origin.includes('vercel.app') || origin.includes('agri-guard') || origin.includes('agriguard')) {
            return callback(null, true);
        }
        // Allow the Render backend itself (self-requests)
        if (origin.includes('onrender.com')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '10mb' }));

// Serve frontend static files from the same directory
app.use(express.static(path.join(__dirname)));

// ============================================================
// HEALTH CHECK — used by frontend to detect backend status
// ============================================================
app.get('/api/health', (req, res) => {
    const hasGroq = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
    const hasOcr = !!process.env.OCR_SPACE_API_KEY && process.env.OCR_SPACE_API_KEY !== 'your_ocr_space_api_key_here';

    res.json({
        status: 'ok',
        version: '1.0.0',
        services: {
            groq: hasGroq ? 'configured' : 'missing_key',
            ocr: hasOcr ? 'configured' : 'missing_key',
            db: masterDB.length > 0 ? `${masterDB.length} chemicals` : 'not_loaded'
        }
    });
});

// ============================================================
// Load Master DB
// ============================================================
const DB_PATH = path.join(__dirname, 'data', 'master_db.json');
let masterDB = [];
try {
    if (fs.existsSync(DB_PATH)) {
        masterDB = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        console.log(`✅ Loaded ${masterDB.length} chemicals from Master DB.`);
    } else {
        console.error('❌ Master DB not found at:', DB_PATH);
    }
} catch (e) {
    console.error('❌ Failed to load Master DB:', e);
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

// ============================================================
// API: OCR Processing (OCR.Space)
// ============================================================
app.post('/api/process-image', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.OCR_SPACE_API_KEY || process.env.OCR_SPACE_API_KEY === 'your_ocr_space_api_key_here') {
        return res.status(503).json({ error: 'OCR.Space API Key not configured. Add it to your .env file.' });
    }

    console.log('📸 Sending image to OCR.Space...');

    try {
        const formData = new FormData();
        // Ensure base64 prefix is stripped
        const base64Clean = image.replace(/^data:image\/[a-z]+;base64,/, '');
        formData.append('base64Image', `data:image/jpeg;base64,${base64Clean}`);
        formData.append('apikey', process.env.OCR_SPACE_API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(25000)
        });

        const data = await response.json();

        if (data.IsErroredOnProcessing) {
            throw new Error(data.ErrorMessage?.[0] || 'OCR Error');
        }

        const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
        console.log('✅ OCR Success. Extracted:', extractedText.substring(0, 60) + '...');

        res.json({ found: true, text: extractedText });

    } catch (error) {
        console.error('❌ OCR.Space Error:', error);
        res.status(500).json({ error: 'OCR Failed', details: error.message });
    }
});

// ============================================================
// API: Analyze Text (DB + Groq AI fallback)
// ============================================================
app.post('/api/analyze', async (req, res) => {
    const { text, language = 'en' } = req.body;
    const targetLang = LANG_MAP[language] || 'English';

    console.log(`🔍 Analyzing text (Target: ${targetLang})...`);

    if (!text) return res.status(400).json({ error: 'No text provided' });

    // ── Guard: reject text that is too short to be a pesticide label ──
    const cleanText = text.trim();
    if (cleanText.length < 20) {
        console.warn('⚠️ Text too short to be a pesticide label:', cleanText.length, 'chars');
        return res.json({ found: false, not_pesticide: true, error: 'Text too short — not a pesticide label' });
    }

    const lowerText = cleanText.toLowerCase();

    // 1. Search Master DB first
    const matches = masterDB.filter(chem => {
        return chem.aliases.some(alias => lowerText.includes(alias.toLowerCase())) ||
            lowerText.includes(chem.name.toLowerCase());
    });

    if (matches.length > 0) {
        const hazardOrder = { 'Ia': 1, 'Ib': 2, 'II': 3, 'III': 4, 'U': 5 };
        matches.sort((a, b) => {
            const hA = hazardOrder[a.hazard_class] || 99;
            const hB = hazardOrder[b.hazard_class] || 99;
            return hA - hB;
        });

        const bestMatch = matches[0];

        // ── Translation for Non-English Requests ──
        if (targetLang !== 'English') {
            console.log(`🌍 Translating DB match for ${bestMatch.name} to ${targetLang}...`);
            try {
                const translationPrompt = `
You are a professional translator for agricultural safety content.
Translate the following English chemical safety data into ${targetLang}.
Keep the meaning precise and simple for farmers.

Source Data:
- Name: ${bestMatch.name}
- Hazard Type: ${bestMatch.hazard_type}
- Side Effects: ${bestMatch.side_effects}
- First Aid: ${bestMatch.first_aid}
- Disposal: ${bestMatch.disposal}
- Precautions: ${bestMatch.precautions}

Return ONLY valid JSON with these keys (keep keys in English):
{
    "name": "...",
    "hazard_type": "...",
    "side_effects": "...",
    "first_aid": "...",
    "disposal": "...",
    "precautions": "..."
}`;

                const completion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: translationPrompt }],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.1
                });

                const content = completion.choices[0]?.message?.content || '{}';
                const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const translatedData = JSON.parse(jsonStr);

                // Merge translated data into bestMatch
                const finalData = { ...bestMatch, ...translatedData };

                console.log(`✅ Translated DB Match to ${targetLang}`);
                return res.json({
                    found: true,
                    source: 'db_translated',
                    data: finalData
                });

            } catch (e) {
                console.error("⚠️ Translation failed, falling back to English DB match:", e.message);
                // Fallthrough to return English data
            }
        }

        console.log(`✅ DB Match: ${bestMatch.name} (${bestMatch.hazard_type})`);

        return res.json({
            found: true,
            source: 'db',
            data: bestMatch
        });
    }

    // 2. Fallback to Groq AI
    console.log('⚠️ No DB match. Switching to Groq AI...');

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return res.json({ found: false, error: 'No DB match and Groq API key not configured' });
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert toxicologist and agronomist specializing in pesticide safety.

CRITICAL RULE: You MUST first determine if the provided text is from a pesticide/agrochemical product label.
A pesticide label typically contains: chemical names, active ingredients, dosage instructions, safety warnings, crop names, or registration numbers.

If the text is NOT from a pesticide label (e.g. it is random text, a selfie caption, a food item, gibberish, or unrelated content), you MUST return ONLY this exact JSON:
{"not_pesticide": true}

If it IS a pesticide label, analyze it and return ONLY valid JSON with this structure (translate all values to ${targetLang}, keep keys in English):
{
    "not_pesticide": false,
    "name": "Chemical Name (in English)",
    "class": "Hazard Class (Ia, Ib, II, III, or U)",
    "hazardType": "Hazard Type String (in ${targetLang})",
    "sideEffects": "Common side effects (in ${targetLang}) - if not on label, provide general pesticide side effects",
    "firstAid": "First aid instructions (in ${targetLang}) - if not on label, provide general pesticide first aid",
    "disposal": "Disposal instructions (in ${targetLang}) - if not on label, provide general disposal advice",
    "precautions": "Safety precautions (in ${targetLang})",
    "dosage": { "default": 0.0, "unit": "ml/L" },
    "crops": ["Crop1", "Crop2"]
}

If specific details are missing from the text, provide standard safety advice for chemical pesticides.
Do not include markdown formatting. Return ONLY raw JSON.`
                },
                {
                    role: 'user',
                    content: cleanText
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1
        });

        const aiResponse = completion.choices[0]?.message?.content || '{}';
        console.log('🤖 Groq Response:', aiResponse.substring(0, 80) + '...');

        // Clean up any markdown code fences
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        let aiData;
        try {
            aiData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('JSON Parse Error on AI response:', cleanJson.substring(0, 100));
            return res.json({ found: false, error: 'AI Response Invalid JSON' });
        }

        // ── If AI says it's not a pesticide label, return that signal ──
        if (aiData.not_pesticide === true) {
            console.warn('🚫 AI determined: not a pesticide label');
            return res.json({ found: false, not_pesticide: true, error: 'Not a pesticide label' });
        }

        return res.json({
            found: true,
            source: 'ai',
            data: aiData
        });

    } catch (error) {
        console.error('❌ Groq API Error:', error.message);
        res.json({ found: false, error: 'AI Analysis Failed: ' + error.message });
    }
});

// ============================================================
// Catch-all: serve index.html for any unmatched route
// ============================================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    console.log('=============================================');
    console.log('🌾 Agri-Guard Backend Running');
    console.log(`🌍 App:    http://localhost:${PORT}`);
    console.log(`📡 API:    http://localhost:${PORT}/api/analyze`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('=============================================');

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn('⚠️  GROQ_API_KEY not set in .env — AI fallback disabled');
    }
    if (!process.env.OCR_SPACE_API_KEY || process.env.OCR_SPACE_API_KEY === 'your_ocr_space_api_key_here') {
        console.warn('⚠️  OCR_SPACE_API_KEY not set in .env — Cloud OCR disabled (Tesseract fallback active)');
    }
});
