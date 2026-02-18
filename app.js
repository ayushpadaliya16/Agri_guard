/* ===========================================
   AGRI-GUARD — Main Application Logic
   Integrates: Tesseract.js OCR + Ollama Llama 3.2
   =========================================== */

// ====== STATE ======
const state = {
    selectedLang: 'gu',
    imageFile: null,
    imageDataUrl: null,
    ocrText: '',
    result: null,
    isProcessing: false,
    ollamaAvailable: false
};

// ====== OLLAMA CONFIG ======
const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2:latest';

// ====== DOM REFS ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEventListeners();
    checkOllamaStatus();
    updateUILanguage(state.selectedLang);
});

// ====== EVENT LISTENERS ======
function initEventListeners() {
    // File input
    const fileInput = $('#file-input');
    const browseBtn = $('#browse-btn');
    const cameraBtn = $('#camera-btn');
    const clearBtn = $('#clear-btn');
    const scanBtn = $('#scan-btn');
    const dropZone = $('#drop-zone');

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleImageFile(e.target.files[0]);
    });

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
    });

    // Clear
    clearBtn.addEventListener('click', clearImage);

    // Camera
    cameraBtn.addEventListener('click', openCamera);

    // Scan
    scanBtn.addEventListener('click', startScan);

    // Language selector
    $$('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedLang = btn.dataset.lang;
            updateUILanguage(btn.dataset.lang);
        });
    });
}

// ====== FULL UI LANGUAGE SWITCHING ======
function updateUILanguage(lang) {
    const t = UI_TEXT[lang];
    if (!t) return;

    // Hero
    const heroTitle = $('#hero-title');
    if (heroTitle) heroTitle.innerHTML = t.heroTitle;
    const heroDesc = $('#hero-desc');
    if (heroDesc) heroDesc.textContent = t.heroDesc;

    // Upload
    const uploadTitle = $('#upload-title');
    if (uploadTitle) uploadTitle.textContent = t.uploadTitle;
    const uploadHint = $('#upload-hint');
    if (uploadHint) uploadHint.textContent = t.uploadHint;

    // Buttons
    const browseBtn = $('#browse-btn');
    if (browseBtn) browseBtn.textContent = t.browseBtn;
    const cameraBtn = $('#camera-btn');
    if (cameraBtn) cameraBtn.textContent = t.cameraBtn;

    // Language label
    const langLabel = $('#lang-label');
    if (langLabel) langLabel.textContent = t.chooseLang;

    // Scan button
    const scanText = $('#scan-btn-text');
    if (scanText) scanText.textContent = t.scanBtn;

    // Processing steps
    const stepOcrLabel = $('#step-ocr-label');
    if (stepOcrLabel) stepOcrLabel.textContent = t.stepOcr;
    const stepOcrStatus = $('#step-ocr-status');
    if (stepOcrStatus) stepOcrStatus.textContent = t.stepOcrStatus;

    const stepThreatLabel = $('#step-threat-label');
    if (stepThreatLabel) stepThreatLabel.textContent = t.stepThreat;
    const stepThreatStatus = $('#step-threat-status');
    if (stepThreatStatus) stepThreatStatus.textContent = t.stepThreatStatus;

    const stepReconstructLabel = $('#step-reconstruct-label');
    if (stepReconstructLabel) stepReconstructLabel.textContent = t.stepReconstruct;
    const stepReconstructStatus = $('#step-reconstruct-status');
    if (stepReconstructStatus) stepReconstructStatus.textContent = t.stepReconstructStatus;

    const stepTranslateLabel = $('#step-translate-label');
    if (stepTranslateLabel) stepTranslateLabel.textContent = t.stepTranslate;
    const stepTranslateStatus = $('#step-translate-status');
    if (stepTranslateStatus) stepTranslateStatus.textContent = t.stepTranslateStatus;

    // Progress text
    const progressText = $('#progress-text');
    if (progressText) progressText.textContent = t.initText;

    // Rich Info Labels (Side Effects, First Aid, Disposal)
    const seLabel = $('#side-effects-label');
    if (seLabel) seLabel.textContent = t.sideEffectsLabel;
    const faLabel = $('#first-aid-label');
    if (faLabel) faLabel.textContent = t.firstAidLabel;
    const dispLabel = $('#disposal-label');
    if (dispLabel) dispLabel.textContent = t.disposalLabel;

    // Feature Buttons
    const emBtn = $('#emergency-call-text');
    if (emBtn) emBtn.textContent = t.emergencyCall;
    const doseBtn = $('#dose-calc-title');
    if (doseBtn) doseBtn.textContent = t.doseCalcTitle;

    // Dosage Modal
    $('#dose-calc-modal-title').textContent = t.doseCalcTitle;
    $('#dose-field-size-label').textContent = t.doseFieldSize;
    $('#dose-amount-label').textContent = "Dose per Acre (ml/g)"; // Fallback or add to translation
    $('#dose-calculate-btn').textContent = t.doseCalculate;
    $('#dose-result-label').textContent = t.doseResult;

    // Weather Widget (Static for now)
    $('#weather-text').textContent = t.weatherWarn;

    // Result card labels (only if not showing results yet)
    const resultHeadlineLabel = document.querySelector('.result-headline .card-label');
    if (resultHeadlineLabel) resultHeadlineLabel.textContent = t.productLabel;
    const resultDosageLabel = document.querySelector('.result-dosage .card-label');
    if (resultDosageLabel) resultDosageLabel.textContent = t.mixingLabel;
    const resultSafetyLabel = document.querySelector('.result-safety .card-label');
    if (resultSafetyLabel) resultSafetyLabel.textContent = t.safetyLabel;
    const resultWarningLabel = document.querySelector('.result-warning .card-label');
    if (resultWarningLabel) resultWarningLabel.textContent = t.warningLabel;

    // Voice section
    const voiceLabel = document.querySelector('.voice-card .card-label');
    if (voiceLabel) voiceLabel.textContent = t.voiceTitle;
    const voiceBtn = $('#voice-btn');
    if (voiceBtn && !state.isProcessing) voiceBtn.textContent = t.voiceBtn;

    // Danger banner
    const dangerText = $('#danger-banner-text');
    if (dangerText) dangerText.textContent = t.dangerBanner;

    // Rescan button
    const rescanBtn = $('#rescan-btn');
    if (rescanBtn) rescanBtn.textContent = t.rescanBtn;

    // Footer
    const footerTitle = $('#footer-title');
    if (footerTitle) footerTitle.textContent = t.footerTitle;
    const footerSub = $('#footer-sub');
    if (footerSub) footerSub.textContent = t.footerSub;

    // First aid & emergency (new features)
    const firstAidTitle = $('#first-aid-title');
    if (firstAidTitle) firstAidTitle.textContent = t.firstAidTitle;
    const emergencyCall = $('#emergency-call-text');
    if (emergencyCall) emergencyCall.textContent = t.emergencyCall;
    const weatherWarn = $('#weather-warn');
    if (weatherWarn) weatherWarn.textContent = t.weatherWarn;
}

// ====== IMAGE HANDLING ======
function handleImageFile(file) {
    if (!file.type.startsWith('image/')) return;
    state.imageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.imageDataUrl = e.target.result;
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showPreview(dataUrl) {
    const previewContainer = $('#preview-container');
    const previewImage = $('#preview-image');
    const dropZone = $('#drop-zone');

    previewImage.src = dataUrl;
    previewContainer.classList.remove('hidden');
    dropZone.classList.add('hidden');
    $('#scan-btn').disabled = false;
}

function clearImage() {
    state.imageFile = null;
    state.imageDataUrl = null;
    const previewContainer = $('#preview-container');
    const dropZone = $('#drop-zone');

    previewContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    $('#scan-btn').disabled = true;
    $('#file-input').value = '';
}

// ====== CAMERA ======
let cameraStream = null;

function openCamera() {
    const modal = $('#camera-modal');
    const video = $('#camera-video');
    modal.classList.remove('hidden');

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Camera error:', err);
            alert('Could not access camera. Please upload an image instead.');
            closeCamera();
        });
}

function closeCamera() {
    const modal = $('#camera-modal');
    const video = $('#camera-video');
    modal.classList.add('hidden');
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    video.srcObject = null;
}

function capturePhoto() {
    const video = $('#camera-video');
    const canvas = $('#camera-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(blob => {
        const file = new File([blob], 'captured-label.jpg', { type: 'image/jpeg' });
        handleImageFile(file);
        closeCamera();
    }, 'image/jpeg', 0.92);
}

// ====== OLLAMA STATUS ======
async function checkOllamaStatus() {
    const dot = $('#llm-status');
    const text = $('#llm-status-text');

    try {
        const res = await fetch(`${OLLAMA_URL}/api/tags`);
        if (res.ok) {
            const data = await res.json();
            const hasLlama = data.models?.some(m => m.name.includes('llama3.2'));
            if (hasLlama) {
                state.ollamaAvailable = true;
                dot.classList.add('online');
                dot.classList.remove('offline');
                text.textContent = 'Llama 3.2 Online';
            } else {
                dot.classList.add('offline');
                text.textContent = 'Llama 3.2 not found';
            }
        }
    } catch (e) {
        dot.classList.add('offline');
        dot.classList.remove('online');
        text.textContent = 'Ollama Offline (fallback mode)';
        state.ollamaAvailable = false;
    }
}

// ====== MAIN SCAN PIPELINE ======
async function startScan() {
    if (state.isProcessing || !state.imageDataUrl) return;
    state.isProcessing = true;

    // UI: Show processing
    $('#upload-section').classList.add('hidden');
    $('#results-section').classList.add('hidden');
    $('#processing-section').classList.remove('hidden');

    const scanBtn = $('#scan-btn');
    scanBtn.disabled = true;

    try {
        // Phase 0: OCR
        setStep('step-ocr', 'active');
        setProgress(10, 'Running OCR on label image...');
        const ocrText = await runOCR(state.imageDataUrl);
        state.ocrText = ocrText;
        setStep('step-ocr', 'done');

        if (!ocrText || ocrText.trim().length < 5) {
            throw new Error('NO_TEXT');
        }

        setProgress(30, 'Text extracted. Analyzing threats...');

        let result;

        // ====== ALWAYS run deterministic extraction first (reliable) ======

        // Phase 1: Threat Detection
        setStep('step-threat', 'active');
        setProgress(40, 'Scanning for toxic chemicals...');
        const threatResult = await runThreatDetection(ocrText, state.selectedLang);
        setStep('step-threat', 'done');
        setProgress(55, 'Threats analyzed. Extracting data...');

        // Phase 2: Data Reconstruction
        setStep('step-reconstruct', 'active');
        setProgress(60, 'Extracting dosage and safety info...');
        const dataResult = runDataReconstruction(ocrText);
        setStep('step-reconstruct', 'done');
        setProgress(75, 'Data extracted. Translating...');

        // Phase 3: Translation
        setStep('step-translate', 'active');

        if (state.ollamaAvailable) {
            // ====== HYBRID: Use LLM to translate the extracted data ======
            setProgress(80, 'Sending to Llama 3.2 for translation...');
            result = await queryOllamaTranslate(threatResult, dataResult, state.selectedLang);
        } else {
            // ====== FALLBACK: Use pre-built translation dictionaries ======
            setProgress(85, 'Translating to ' + TRANSLATIONS[state.selectedLang].langName + '...');
            result = buildResult(threatResult, dataResult, state.selectedLang);
        }

        setStep('step-translate', 'done');
        setProgress(95, 'Translation complete!');

        state.result = result;
        setProgress(100, 'Done! Displaying results...');

        await sleep(400);
        displayResults(result);

    } catch (err) {
        console.error('Scan error:', err);
        if (err.message === 'NO_TEXT') {
            alert('❌ Could not read any text from this image. Please try a clearer photo of the pesticide label.');
        } else {
            alert('❌ An error occurred: ' + err.message);
        }
        resetToUpload();
    }

    state.isProcessing = false;
}

// ====== PHASE 0: OCR ENGINE (Hybrid: Cloud -> Local) ======
async function runOCR(imageDataUrl) {
    // 1. Try Cloud OCR (OCR.Space) via Backend
    try {
        if (!navigator.onLine) throw new Error("Offline");

        console.log("☁️ Attempting Cloud OCR...");
        // Strip prefix if present for API
        const base64Image = imageDataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

        const response = await fetch('http://localhost:3001/api/process-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (data.found && data.text.length > 5) {
            console.log("✅ Cloud OCR Success:", data.text);
            return data.text;
        }
    } catch (e) {
        console.warn("⚠️ Cloud OCR failed/offline, switching to local Tesseract:", e);
    }

    // 2. Fallback to Local Tesseract.js
    console.log("💻 Running Local Tesseract OCR...");
    const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                const pct = Math.round(10 + m.progress * 20);
                setProgress(pct, `OCR: ${Math.round(m.progress * 100)}% complete...`);
            }
        }
    });

    const { data: { text } } = await worker.recognize(imageDataUrl);
    await worker.terminate();
    return text;
}

// ====== OLLAMA LLM INTEGRATION (Translation Only) ======
async function queryOllamaTranslate(threatResult, dataResult, langCode) {
    const t = TRANSLATIONS[langCode];
    const langName = t.langName;

    // Build the data summary to translate
    const productName = dataResult.productName || 'Unknown Product';
    const chemNames = threatResult.chemicals.map(c => `${c.name} (${c.hazard})`).join(', ') || 'None detected';
    const dosageInfo = dataResult.dosage.found
        ? `${dataResult.dosage.amount} ${dataResult.dosage.unit} per ${dataResult.dosage.perAmount} ${dataResult.dosage.perUnit}`
        : 'Dosage not found - contact dealer';
    const gearList = dataResult.safetyGear.join(', ');
    const dangerLevel = threatResult.highestClass
        ? `Class ${threatResult.highestClass} - ${threatResult.chemicals[0]?.hazard || 'HAZARDOUS'}`
        : (threatResult.isDangerous ? 'Dangerous' : 'Use with caution');

    const prompt = `Translate the following pesticide safety information into ${langName}. Use simple village-friendly language that a farmer can understand. Be caring but urgent about safety.

Product: ${productName}
Chemicals Found: ${chemNames}
Danger Level: ${dangerLevel}
Mixing Dosage: ${dosageInfo}
Required Safety Gear: ${gearList}
Is Dangerous: ${threatResult.isDangerous ? 'YES' : 'NO'}

Reply with ONLY valid JSON, nothing else:
{"headline":"product name in ${langName}","mix_instruction":"simple mixing instruction in ${langName}","safety_gear":"list each safety gear item in ${langName} separated by bullet •","warning_banner":"urgent safety warning in ${langName}","voice_script":"2 sentence urgent safety summary in ${langName} for speaking aloud"}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
        setProgress(82, `Llama 3.2 is translating to ${langName} (20-40 sec)...`);

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.4,
                    num_predict: 512,
                    top_p: 0.9
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Ollama request failed');

        const data = await response.json();
        let responseText = data.response || '';
        let parsed = tryParseJSON(responseText);

        if (parsed && parsed.headline) {
            // Successfully got LLM translation — build full result
            return {
                meta: {
                    model: "Llama 3.2 3B (Antigravity)",
                    danger_alert: threatResult.isDangerous
                },
                farmer_display: {
                    headline: parsed.headline,
                    mix_instruction: parsed.mix_instruction || t.ui.contactDealer,
                    safety_gear: parsed.safety_gear || gearList,
                    warning_banner: parsed.warning_banner || t.warnings.generic
                },
                voice_synthesis: {
                    script: parsed.voice_script || t.voiceTemplate(productName, t.warnings.generic)
                },
                _internal: {
                    ocr_text: dataResult.rawText,
                    chemicals_found: threatResult.chemicals.map(c => c.name),
                    keywords_found: threatResult.keywords,
                    hazard_class: threatResult.highestClass,
                    language: langCode,
                    source: 'llama3.2'
                }
            };
        }

        console.warn('LLM translation failed, using dictionary fallback');
        console.log('Raw LLM response:', responseText);
        return buildResult(threatResult, dataResult, langCode);

    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.warn('Ollama timed out, using dictionary fallback');
            setProgress(90, 'LLM timed out — using dictionary translation...');
        } else {
            console.error('Ollama error:', err);
            setProgress(90, 'LLM error — using dictionary translation...');
        }
        return buildResult(threatResult, dataResult, langCode);
    }
}

function tryParseJSON(text) {
    // Try direct parse
    try {
        return JSON.parse(text);
    } catch (e) { }

    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) { }
    }

    return null;
}

function buildFallbackResult(ocrText, langCode, quickThreat) {
    const threatResult = quickThreat || runThreatDetection(ocrText);
    const dataResult = runDataReconstruction(ocrText);
    return buildResult(threatResult, dataResult, langCode);
}

// ====== QUICK THREAT SCAN (fast local check) ======
function quickThreatScan(text) {
    const lower = text.toLowerCase();
    const foundKeys = DANGER_KEYWORDS.filter(kw => lower.includes(kw));
    const foundChems = [];

    for (const chem of CHEMICALS_DB) {
        for (const alias of chem.aliases) {
            if (lower.includes(alias.toLowerCase())) {
                foundChems.push(chem);
                break;
            }
        }
    }

    return {
        isDangerous: foundKeys.length > 0 || foundChems.length > 0,
        keywords: foundKeys,
        chemicals: foundChems,
        highestClass: foundChems.length > 0
            ? foundChems.sort((a, b) => {
                const order = { 'Ia': 0, 'Ib': 1, 'II': 2, 'III': 3 };
                return (order[a.class] || 9) - (order[b.class] || 9);
            })[0].class
            : null
    };
}

// ====== PHASE 1: THREAT DETECTION (Hybrid: Online -> Offline) ======
async function runThreatDetection(text, language = 'en') {
    // 1. Try Backend API (Online Mode)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout for AI translation

        console.log("📡 Attempting Backend Analysis in " + language + "...");
        // Use absolute URL to allow running frontend on 3000 and backend on 3001
        const response = await fetch('http://localhost:3001/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.found) {
                console.log("✅ Backend Analysis Successful:", data.data.name);
                showOnlineStatus(true);
                return formatBackendResult(data.data);
            }
        }
    } catch (e) {
        console.warn("⚠️ Backend unreachable, using offline mode.");
        showOnlineStatus(false);
    }

    // 2. Fallback to Local Logic (Offline Mode)
    return quickThreatScan(text);
}

function showOnlineStatus(isOnline) {
    const dot = document.getElementById('llm-status');
    const text = document.getElementById('llm-status-text');
    if (dot && text) {
        if (isOnline) {
            dot.classList.add('online');
            dot.classList.remove('offline');
            text.textContent = 'Agri-Guard Cloud: Connected';
        } else {
            dot.classList.add('offline');
            dot.classList.remove('online');
            text.textContent = 'Agri-Guard Offline Mode';
        }
    }
}

function formatBackendResult(apiData) {
    return {
        isDangerous: true,
        chemicals: [{
            name: apiData.name,
            class: apiData.class,
            hazard: apiData.hazardType,
            // Rich Data attached largely for buildResult to use
            sideEffects: apiData.sideEffects,
            firstAid: apiData.firstAid,
            disposal: apiData.disposal,
            precautions: apiData.precautions,
            dosage: apiData.dosage,
            crops: apiData.crops,
            aliases: [apiData.name] // Shim for internal logic
        }],
        keywords: [],
        highestClass: apiData.class
    };
}

// ====== PHASE 2: DATA RECONSTRUCTION (Deterministic) ======
function runDataReconstruction(text) {
    const result = {
        productName: extractProductName(text),
        dosage: extractDosage(text),
        safetyGear: extractSafetyGear(text),
        rawText: text
    };
    return result;
}

function extractProductName(text) {
    // Try to get the first significant line as product name
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

    // Look for lines that look like product names (uppercase, short)
    for (const line of lines.slice(0, 5)) {
        const clean = line.replace(/[^a-zA-Z0-9\s\-\.]/g, '').trim();
        if (clean.length > 3 && clean.length < 60) {
            return clean;
        }
    }
    return lines[0] || 'Unknown Product';
}

function extractDosage(text) {
    for (const pattern of DOSAGE_PATTERNS) {
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        if (match) {
            return {
                found: true,
                raw: match[0],
                amount: match[1],
                unit: match[0].toLowerCase().includes('ml') ? 'ml' : 'g',
                perAmount: match[2] || '1',
                perUnit: 'liter'
            };
        }
    }
    return { found: false };
}

function extractSafetyGear(text) {
    const lower = text.toLowerCase();
    const gearFound = [];

    for (const [gear, keywords] of Object.entries(GEAR_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                gearFound.push(gear);
                break;
            }
        }
    }

    // If dangerous chemical detected but no gear mentioned, recommend full set
    if (gearFound.length === 0) {
        return ['gloves', 'mask', 'goggles', 'boots'];
    }
    return gearFound;
}

// ====== PHASE 3: BUILD RESULT (Deterministic) ======
function buildResult(threatResult, dataResult, langCode) {
    const t = TRANSLATIONS[langCode];

    // Determine warning level
    let warningKey = 'generic';
    if (threatResult.highestClass === 'Ia') warningKey = 'extremelyHazardous';
    else if (threatResult.highestClass === 'Ib') warningKey = 'highlyHazardous';
    else if (threatResult.highestClass === 'II') warningKey = 'moderatelyHazardous';
    else if (threatResult.highestClass === 'III') warningKey = 'slightlyHazardous';
    else if (threatResult.isDangerous) warningKey = 'moderatelyHazardous';

    // Build dosage string
    let mixInstruction;
    if (dataResult.dosage.found) {
        mixInstruction = t.dosageTemplate(
            dataResult.dosage.amount,
            dataResult.dosage.unit,
            dataResult.dosage.perAmount,
            dataResult.dosage.perUnit
        );
    } else {
        mixInstruction = t.ui.contactDealer;
    }

    // Build safety gear string
    const gearList = dataResult.safetyGear.map(g => t.gear[g] || g).join(' • ');

    // Build headline
    const headline = dataResult.productName;

    // Build voice script
    const voiceScript = t.voiceTemplate(headline, t.warnings[warningKey]);

    // Get rich data from DB match if available
    const dbMatch = threatResult.chemicals[0];

    return {
        meta: {
            model: state.ollamaAvailable ? "Llama 3.2 3B (Antigravity)" : "Agri-Guard Deterministic Engine",
            danger_alert: threatResult.isDangerous
        },
        farmer_display: {
            headline: headline,
            mix_instruction: mixInstruction,
            safety_gear: gearList,
            warning_banner: t.warnings[warningKey],
            // Rich Data
            side_effects: dbMatch ? dbMatch.sideEffects : t.ui?.noInfo || "---",
            first_aid: dbMatch ? dbMatch.firstAid : t.ui?.noInfo || "---",
            disposal: dbMatch ? dbMatch.disposal : t.ui?.noInfo || "---"
        },
        voice_synthesis: {
            script: voiceScript
        },
        _internal: {
            ocr_text: state.ocrText,
            chemicals_found: threatResult.chemicals.map(c => c.name),
            keywords_found: threatResult.keywords,
            hazard_class: threatResult.highestClass,
            language: langCode
        }
    };
}

// ====== DISPLAY RESULTS ======
function displayResults(result) {
    const t = TRANSLATIONS[state.selectedLang];

    // Hide processing, show results
    $('#processing-section').classList.add('hidden');
    $('#results-section').classList.remove('hidden');

    // Danger banner
    const ut = UI_TEXT[state.selectedLang] || UI_TEXT.hi;
    const dangerBanner = $('#result-danger-banner');
    if (result.meta.danger_alert) {
        dangerBanner.classList.remove('hidden');
        const chemNames = result._internal?.chemicals_found?.join(', ') || '';
        $('#danger-banner-text').textContent = chemNames
            ? `⚠️ ${chemNames} — ${ut.dangerBanner}`
            : ut.dangerBanner;

        // Show danger overlay
        showDangerOverlay(chemNames);
        playDangerSound();
    } else {
        dangerBanner.classList.add('hidden');
    }

    // Result cards
    $('#result-headline').textContent = result.farmer_display.headline;
    $('#result-dosage').textContent = result.farmer_display.mix_instruction;
    $('#result-safety').textContent = result.farmer_display.safety_gear;
    $('#result-warning').textContent = result.farmer_display.warning_banner;

    // Render Rich Info
    $('#result-side-effects').textContent = result.farmer_display.side_effects || "---";
    $('#result-first-aid').textContent = result.farmer_display.first_aid || "---";
    $('#result-disposal').textContent = result.farmer_display.disposal || "---";

    // Apply font for the selected language
    const resultCards = $$('.card-value');
    resultCards.forEach(el => {
        el.style.fontFamily = t.fontFamily;
    });

    // Voice
    $('#voice-script').textContent = result.voice_synthesis.script;
    $('#voice-script').style.fontFamily = t.fontFamily;

    // JSON output
    const jsonDisplay = { ...result };
    delete jsonDisplay._internal;
    $('#json-output').textContent = JSON.stringify(jsonDisplay, null, 2);
}

// ====== DANGER OVERLAY ======
function showDangerOverlay(chemName) {
    const overlay = $('#danger-overlay');
    overlay.classList.remove('hidden');
    if (chemName) {
        $('#danger-chemical').textContent = `Toxic Chemical: ${chemName}`;
    }
}

function dismissDangerOverlay() {
    $('#danger-overlay').classList.add('hidden');
}

// ====== DANGER SOUND ======
function playDangerSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create a warning beep pattern
        const playBeep = (time, freq, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'square';
            gain.gain.value = 0.15;
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
            osc.start(time);
            osc.stop(time + duration);
        };

        const now = audioCtx.currentTime;
        playBeep(now, 880, 0.2);
        playBeep(now + 0.3, 880, 0.2);
        playBeep(now + 0.6, 660, 0.4);
    } catch (e) {
        console.warn('Could not play danger sound:', e);
    }
}

// ====== VOICE / TTS (Dual Engine) ======
// Google Translate TTS language codes
const GTTS_LANG_MAP = {
    gu: 'gu', hi: 'hi', mr: 'mr', pa: 'pa',
    ta: 'ta', te: 'te', kn: 'kn', ml: 'ml',
    bn: 'bn', or: 'or'
};

function speakResults() {
    if (!state.result) return;

    const script = state.result.voice_synthesis.script;
    const btn = $('#voice-btn');

    // Try Google Translate TTS first (much better Indian language voices)
    const gttsLang = GTTS_LANG_MAP[state.selectedLang] || 'hi';

    try {
        // Split text into chunks of ~200 chars (Google TTS limit)
        const chunks = splitTextForTTS(script, 200);
        let currentChunk = 0;

        btn.textContent = '🔊 Bol raha hai...';

        function playNextChunk() {
            if (currentChunk >= chunks.length) {
                btn.textContent = '🔊 Suraksha Suno';
                return;
            }

            const text = chunks[currentChunk];
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${gttsLang}&client=tw-ob&q=${encodeURIComponent(text)}`;

            const audio = new Audio(url);
            audio.playbackRate = 0.9;

            audio.onended = () => {
                currentChunk++;
                playNextChunk();
            };

            audio.onerror = () => {
                // If Google TTS fails, fall back to browser TTS
                console.warn('Google TTS failed, using browser fallback');
                speakWithBrowserTTS(script);
            };

            audio.play().catch(() => {
                // Autoplay blocked or offline — use browser TTS
                speakWithBrowserTTS(script);
            });
        }

        playNextChunk();

    } catch (e) {
        console.warn('Google TTS error, using browser fallback:', e);
        speakWithBrowserTTS(script);
    }
}

function splitTextForTTS(text, maxLen) {
    const chunks = [];
    // Split on sentence boundaries
    const sentences = text.split(/(?<=[।\.\!\?])\s*/);
    let current = '';

    for (const sentence of sentences) {
        if ((current + ' ' + sentence).length > maxLen && current.length > 0) {
            chunks.push(current.trim());
            current = sentence;
        } else {
            current = current ? current + ' ' + sentence : sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());

    // If no splits happened (no sentence boundaries), force split
    if (chunks.length === 0 && text.length > 0) {
        for (let i = 0; i < text.length; i += maxLen) {
            chunks.push(text.substring(i, i + maxLen));
        }
    }

    return chunks;
}

function speakWithBrowserTTS(script) {
    const t = TRANSLATIONS[state.selectedLang];

    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not available. Please make sure you are online for Google voice.');
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const langCode = state.selectedLang;
    const fullLangCode = t.langCode;

    let selectedVoice = voices.find(v => v.lang === fullLangCode)
        || voices.find(v => v.lang.startsWith(langCode))
        || voices.find(v => v.lang.startsWith('hi'))
        || voices.find(v => v.lang.endsWith('-IN'));

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
    } else {
        utterance.lang = fullLangCode;
    }

    window.speechSynthesis.speak(utterance);

    const btn = $('#voice-btn');
    btn.textContent = `🔊 Bol raha hai (${selectedVoice?.name || 'Browser'})...`;
    utterance.onend = () => {
        btn.textContent = '🔊 Suraksha Suno';
    };
}

// Load voices (some browsers load them async)
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// ====== UI HELPERS ======
function setStep(stepId, status) {
    const el = $(`#${stepId}`);
    el.classList.remove('active', 'done');
    el.classList.add(status);
}

function setProgress(pct, text) {
    $('#progress-fill').style.width = pct + '%';
    if (text) $('#progress-text').textContent = text;
}

function resetToUpload() {
    $('#processing-section').classList.add('hidden');
    $('#results-section').classList.add('hidden');
    $('#upload-section').classList.remove('hidden');

    // Reset processing steps
    ['step-ocr', 'step-threat', 'step-reconstruct', 'step-translate'].forEach(id => {
        $(`#${id}`).classList.remove('active', 'done');
    });
    setProgress(0, '');

    state.isProcessing = false;
    $('#scan-btn').disabled = !state.imageDataUrl;
}

function resetApp() {
    clearImage();
    resetToUpload();
    state.result = null;
    state.ocrText = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== PARTICLE BACKGROUND ======
function initParticles() {
    const canvas = $('#particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 150 : 200; // green or cyan
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles (fewer on mobile)
    const count = window.innerWidth < 600 ? 40 : 80;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.05 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animFrame = requestAnimationFrame(animate);
    }
    animate();
}

// ====== DOSAGE CALCULATOR ======
window.calculateDosage = function () {
    const fieldSize = parseFloat(document.getElementById('field-size').value);
    const dosePerAcre = parseFloat(document.getElementById('dose-per-acre').value);

    if (isNaN(fieldSize) || isNaN(dosePerAcre)) {
        alert("Please enter valid numbers");
        return;
    }

    const total = fieldSize * dosePerAcre;
    const resultBox = document.getElementById('dose-result-box');
    if (resultBox) {
        resultBox.classList.remove('hidden');

        let amountStr = total.toFixed(1);
        // If > 1000 ml/g, convert to L/kg for better readability
        if (total >= 1000) {
            amountStr = (total / 1000).toFixed(2) + " L / kg";
        } else {
            amountStr += " ml / g";
        }

        const totalEl = document.getElementById('dose-total');
        if (totalEl) totalEl.textContent = amountStr;
    }
};
