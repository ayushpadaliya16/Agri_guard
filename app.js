/* ===========================================
   AGRI-GUARD — Main Application Logic
   Integrates: Tesseract.js OCR + Ollama Llama 3.2
   =========================================== */

// ====== STATE ======
const state = {
    selectedLang: 'en',
    imageFile: null,
    imageDataUrl: null,
    ocrText: '',
    result: null,
    isProcessing: false,
    ollamaAvailable: false,
    shouldStopVoice: false,
    currentAudio: null
};

// ====== API CONFIG ======
// Auto-detect backend URL:
// - Local dev (localhost): use same origin (empty string)
// - Production (Vercel or any other host): use deployed Render backend
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? '' : 'https://agri-guard-6535.onrender.com';

// Legacy Ollama config (kept for backward compat, not actively used)
const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2:latest';

// ====== DOM REFS ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEventListeners();
    checkBackendStatus();
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

    // Scan — if not ready (no image), show hint
    scanBtn.addEventListener('click', () => {
        if (scanBtn.classList.contains('btn-disabled')) {
            showScanHint();
            return;
        }
        startScan();
    });

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

// ====== STEP CARD CLICK HANDLERS ======
// Step 1: scroll to upload section
// Step 2: scroll to upload section and trigger scan (if image loaded)
// Step 3: scroll to results section (if results exist)
// Scroll to element accounting for sticky header offset
function scrollToSection(el) {
    if (!el) return;
    const headerOffset = 90; // sticky header + tricolor ribbon
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function stepCardClick(step) {
    if (step === 1) {
        const uploadSection = $('#upload-section');
        if (uploadSection) {
            scrollToSection(uploadSection);
            const card = $('#upload-card');
            if (card) {
                card.style.transition = 'box-shadow 0.3s';
                card.style.boxShadow = '0 0 0 3px rgba(19,136,8,0.5)';
                setTimeout(() => { card.style.boxShadow = ''; }, 1200);
            }
        }
    } else if (step === 2) {
        const scanBtn = $('#scan-btn');
        if (!scanBtn.classList.contains('btn-disabled')) {
            scrollToSection(scanBtn);
            setTimeout(() => startScan(), 400);
        } else {
            const uploadSection = $('#upload-section');
            if (uploadSection) scrollToSection(uploadSection);
            showScanHint();
        }
    } else if (step === 3) {
        const resultsSection = $('#results-section');
        if (resultsSection && !resultsSection.classList.contains('hidden')) {
            scrollToSection(resultsSection);
        } else {
            showScanHint();
        }
    }
}

// ── Smooth scroll to the upload section ──
function scrollToUpload() {
    scrollToSection($('#upload-section'));
}

// ── Show a brief hint when scan button is clicked without an image ──
function showScanHint() {
    const hint = $('#upload-hint');
    if (!hint) return;
    const original = hint.textContent;
    hint.textContent = '⬆️ Pehle photo upload karo, phir scan karo!';
    hint.style.color = '#138808'; // India green (light theme fix)
    hint.style.fontWeight = '700';
    setTimeout(() => {
        hint.textContent = original;
        hint.style.color = '';
        hint.style.fontWeight = '';
    }, 2500);
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

    // ── NEW: Hero badge & stats bar ──
    const heroBadge = $('#hero-badge');
    if (heroBadge && t.heroBadge) heroBadge.textContent = t.heroBadge;
    const statLang = $('#stat-lang');
    if (statLang && t.statLang) statLang.textContent = t.statLang;
    const statOffline = $('#stat-offline');
    if (statOffline && t.statOffline) statOffline.textContent = t.statOffline;

    // ── NEW: How It Works section ──
    const howItWorksTitle = $('#how-it-works-title');
    if (howItWorksTitle && t.howItWorksTitle) howItWorksTitle.textContent = t.howItWorksTitle;
    const step1Title = $('#step1-title');
    if (step1Title && t.step1Title) step1Title.textContent = t.step1Title;
    const step1Desc = $('#step1-desc');
    if (step1Desc && t.step1Desc) step1Desc.textContent = t.step1Desc;
    const step2Title = $('#step2-title');
    if (step2Title && t.step2Title) step2Title.textContent = t.step2Title;
    const step2Desc = $('#step2-desc');
    if (step2Desc && t.step2Desc) step2Desc.textContent = t.step2Desc;
    const step3Title = $('#step3-title');
    if (step3Title && t.step3Title) step3Title.textContent = t.step3Title;
    const step3Desc = $('#step3-desc');
    if (step3Desc && t.step3Desc) step3Desc.textContent = t.step3Desc;

    // ── NEW: Processing title ──
    const processTitle = $('#process-title');
    if (processTitle && t.processingTitle) processTitle.textContent = t.processingTitle;

    // ── NEW: Result card labels by ID ──
    const productLabel = $('#product-label');
    if (productLabel && t.productLabel) productLabel.textContent = t.productLabel.toUpperCase();
    const mixingLabel = $('#mixing-label');
    if (mixingLabel && t.mixingLabel) mixingLabel.textContent = t.mixingLabel.toUpperCase();
    const safetyLabel = $('#safety-label');
    if (safetyLabel && t.safetyLabel) safetyLabel.textContent = t.safetyLabel.toUpperCase();
    const warningLabel = $('#warning-label');
    if (warningLabel && t.warningLabel) warningLabel.textContent = t.warningLabel.toUpperCase();

    // ── NEW: Footer disclaimer ──
    const footerDisclaimer = $('#footer-disclaimer');
    if (footerDisclaimer && t.footerDisclaimer) footerDisclaimer.textContent = t.footerDisclaimer;

    // ── NEW: Nav info link ──
    const navInfoLink = $('#nav-info-link');
    if (navInfoLink && t.infoPageLink) navInfoLink.textContent = t.infoPageLink;
    const footerInfoLink = $('#footer-info-link');
    if (footerInfoLink && t.infoPageLink) footerInfoLink.textContent = t.infoPageLink;

    // Update html lang attribute
    document.documentElement.lang = lang;
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
    $('#scan-btn').classList.remove('btn-disabled');
}

function clearImage() {
    state.imageFile = null;
    state.imageDataUrl = null;
    const previewContainer = $('#preview-container');
    const dropZone = $('#drop-zone');

    previewContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    $('#scan-btn').classList.add('btn-disabled');
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

// ====== BACKEND STATUS CHECK ======
async function checkBackendStatus() {
    const dot = $('#llm-status');
    const text = $('#llm-status-text');

    try {
        const res = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            const groqOk = data.services?.groq === 'configured';
            const dbOk = data.services?.db && data.services.db !== 'not_loaded';

            state.ollamaAvailable = false; // not using Ollama
            dot.classList.add('online');
            dot.classList.remove('offline');

            if (groqOk && dbOk) {
                text.textContent = '✅ Backend Connected';
            } else if (dbOk) {
                text.textContent = '⚡ Backend (DB only)';
            } else {
                text.textContent = '⚠️ Backend: Keys Missing';
            }
        } else {
            throw new Error('Non-OK response');
        }
    } catch (e) {
        dot.classList.add('offline');
        dot.classList.remove('online');
        text.textContent = 'Offline Mode (Tesseract)';
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

        // ── Pesticide label validation ──
        // Check if the extracted text contains any pesticide-related keywords.
        // A real label will have at least one of: chemical names, dosage words,
        // safety/warning terms, or registration numbers.
        const pesticideKeywords = [
            // Chemical / ingredient words
            'chlor', 'phosph', 'sulph', 'sulfur', 'oxide', 'nitro', 'cyper',
            'malath', 'endos', 'diazon', 'carbar', 'thiram', 'captan', 'zineb',
            'mancoz', 'copper', 'lambda', 'deltam', 'imidacl', 'acetam',
            'glyphos', 'paraquat', 'atrazin', 'herbic', 'fungic', 'insect',
            'pesticide', 'keetnaashak', 'keetnashak', 'dawai', 'dawa',
            // Dosage / usage words
            'ml', 'gram', 'litre', 'liter', 'acre', 'hectare', 'dilut',
            'spray', 'mix', 'dose', 'dosage', 'concentration', 'per',
            'matra', 'mili', 'kilo',
            // Safety / warning words
            'poison', 'toxic', 'danger', 'warning', 'caution', 'hazard',
            'antidote', 'first aid', 'keep away', 'wear', 'gloves', 'mask',
            'khatre', 'zeher', 'savdhan', 'suraksha',
            // Registration / label words
            'reg. no', 'reg no', 'registration', 'batch', 'mfg', 'expiry',
            'net content', 'manufactured', 'formulation', 'w/v', 'w/w', 'ec',
            'wp', 'sc', 'sl', 'granule', 'emulsifiable',
            // Crop words
            'cotton', 'wheat', 'rice', 'paddy', 'maize', 'soybean', 'sugarcane',
            'tomato', 'potato', 'onion', 'crop', 'fasal', 'gehu', 'chawal'
        ];

        const lowerOcr = ocrText.toLowerCase();
        const hasPesticideKeyword = pesticideKeywords.some(kw => lowerOcr.includes(kw));

        if (!hasPesticideKeyword) {
            throw new Error('NOT_PESTICIDE_LABEL');
        }

        setProgress(30, 'Pesticide label confirmed. Analyzing threats...');

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
            showScanError(
                '📷 Image Not Readable',
                'Could not read any text from this image.\nPlease take a clearer photo of the pesticide label with good lighting.'
            );
        } else if (err.message === 'NOT_PESTICIDE_LABEL') {
            showScanError(
                '🚫 Not a Pesticide Label',
                'This image does not appear to be a pesticide bottle or packet label.\n\nPlease upload a photo of an actual pesticide/agrochemical product label.'
            );
        } else {
            showScanError('❌ Error', 'An error occurred: ' + err.message);
        }
        resetToUpload();
    }


    state.isProcessing = false;
}

// ── Show a friendly in-page error when scan fails ──
function showScanError(title, message) {
    // Hide processing, show upload section with error card
    $('#processing-section').classList.add('hidden');
    $('#upload-section').classList.remove('hidden');

    // Remove any existing error card
    const existing = document.getElementById('scan-error-card');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.id = 'scan-error-card';
    card.style.cssText = `
        background: #FFF5F5;
        border: 1px solid rgba(198,40,40,0.3);
        border-left: 4px solid #c62828;
        border-radius: 16px;
        padding: 20px 24px;
        margin: 16px 0;
        animation: fadeInUp 0.3s ease;
    `;
    card.innerHTML = `
        <div style="font-size:1.5rem;margin-bottom:8px;color:#B71C1C;">${title}</div>
        <p style="color:#555;font-size:0.95rem;white-space:pre-line;">${message}</p>
        <button onclick="document.getElementById('scan-error-card').remove()"
            style="margin-top:14px;padding:8px 18px;background:#FFEBEE;
            border:1px solid rgba(198,40,40,0.4);border-radius:50px;color:#c62828;
            cursor:pointer;font-size:0.85rem;font-family:inherit;font-weight:600;">
            ✕ Dismiss
        </button>
    `;

    // Insert before the scan button
    const scanBtn = $('#scan-btn');
    scanBtn.parentNode.insertBefore(card, scanBtn);
}


async function runOCR(imageDataUrl) {
    // 1. Try Cloud OCR (OCR.Space) via Backend
    try {
        if (!navigator.onLine) throw new Error("Offline");

        console.log("☁️ Attempting Cloud OCR...");
        // Strip prefix if present for API
        const base64Image = imageDataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

        const response = await fetch(`${API_BASE_URL}/api/process-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
            signal: AbortSignal.timeout(30000)
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
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
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
            class: apiData.class || apiData.hazard_class,
            hazard: apiData.hazardType || apiData.hazard_type,
            // Rich Data attached largely for buildResult to use (handle both CamelCase from AI and snake_case from DB)
            sideEffects: apiData.sideEffects || apiData.side_effects,
            firstAid: apiData.firstAid || apiData.first_aid,
            disposal: apiData.disposal,
            precautions: apiData.precautions,
            dosage: apiData.dosage,
            crops: apiData.crops,
            aliases: apiData.aliases || [apiData.name] // Shim for internal logic
        }],
        keywords: [],
        highestClass: apiData.class || apiData.hazard_class
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
            // Rich Data (with robust fallback for 'Unknown')
            side_effects: (dbMatch?.sideEffects && dbMatch.sideEffects.toLowerCase() !== 'unknown') ? dbMatch.sideEffects : "Nausea, dizziness, skin irritation. Wash immediately if exposed.",
            first_aid: (dbMatch?.firstAid && dbMatch.firstAid.toLowerCase() !== 'unknown') ? dbMatch.firstAid : "Wash with plenty of water and soap. Remove contaminated clothing. Seek medical help.",
            disposal: (dbMatch?.disposal && dbMatch.disposal.toLowerCase() !== 'unknown') ? dbMatch.disposal : "Do not reuse container. Triple rinse, crush/puncture and bury away from water sources."
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

    // Hide everything except results
    $('#processing-section').classList.add('hidden');
    $('#hero-section').classList.add('hidden');
    $('#how-it-works-section').classList.add('hidden');
    $('#upload-section').classList.add('hidden');
    $('#results-section').classList.remove('hidden');
    // Scroll to top of results
    setTimeout(() => scrollToSection($('#results-section')), 100);

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

// Helper: set audio buttons to "playing" state
function setVoicePlaying() {
    const playBtn = $('#voice-btn');
    const stopBtn = $('#voice-stop-btn');
    if (playBtn) {
        playBtn.disabled = true;
        playBtn.style.opacity = '0.7';
        playBtn.textContent = '🔊 Bol raha hai...';
    }
    if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.style.opacity = '1';
        stopBtn.style.cursor = 'pointer';
    }
}

function speakResults() {
    if (!state.result) return;

    // Kill any existing audio inline (without touching UI buttons)
    state.shouldStopVoice = true;
    if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const script = state.result.voice_synthesis.script;

    // Reset flag and activate UI
    state.shouldStopVoice = false;
    setVoicePlaying();

    // Try Google Translate TTS first (much better Indian language voices)
    const gttsLang = GTTS_LANG_MAP[state.selectedLang] || 'hi';

    try {
        const chunks = splitTextForTTS(script, 200);
        let currentChunk = 0;

        function playNextChunk() {
            if (state.shouldStopVoice) return;

            if (currentChunk >= chunks.length) {
                stopVoice(); // All chunks done — reset UI
                return;
            }

            const text = chunks[currentChunk];
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${gttsLang}&client=tw-ob&q=${encodeURIComponent(text)}`;

            const audio = new Audio(url);
            state.currentAudio = audio;
            audio.playbackRate = 0.9;

            audio.onended = () => {
                if (!state.shouldStopVoice) {
                    currentChunk++;
                    playNextChunk();
                }
            };

            audio.onerror = () => {
                console.warn('Google TTS failed, using browser fallback');
                speakWithBrowserTTS(script);
            };

            audio.play().catch(() => {
                speakWithBrowserTTS(script);
            });
        }

        playNextChunk();

    } catch (e) {
        console.warn('Google TTS error, using browser fallback:', e);
        speakWithBrowserTTS(script);
    }
}

function stopVoice() {
    state.shouldStopVoice = true;

    // Stop Google TTS audio
    if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio.onended = null;
        state.currentAudio.onerror = null;
        state.currentAudio = null;
    }

    // Stop browser TTS
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Reset UI
    const playBtn = $('#voice-btn');
    const stopBtn = $('#voice-stop-btn');

    if (playBtn) {
        playBtn.disabled = false;
        playBtn.style.opacity = '1';
        // Restore translated label if available, else fallback
        const t = TRANSLATIONS[state.selectedLang];
        playBtn.textContent = (t && t.voiceBtn) ? t.voiceBtn : '🔊 Suraksha Suno';
    }

    if (stopBtn) {
        stopBtn.disabled = true;
        stopBtn.style.opacity = '0.4';
        stopBtn.style.cursor = 'not-allowed';
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
    if (state.shouldStopVoice) return; // User already clicked stop

    const t = TRANSLATIONS[state.selectedLang];

    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not available in your browser.');
        stopVoice();
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

    // Ensure stop button is active while speaking
    setVoicePlaying();

    window.speechSynthesis.speak(utterance);

    utterance.onend = () => stopVoice();
    utterance.onerror = (e) => {
        console.warn('Browser TTS error:', e);
        stopVoice();
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
    const scanBtn = $('#scan-btn');
    scanBtn.disabled = false; // Fix: Re-enable the button interaction (it was disabled in startScan)
    if (state.imageDataUrl) {
        scanBtn.classList.remove('btn-disabled');
    } else {
        scanBtn.classList.add('btn-disabled');
    }
}

function resetApp() {
    clearImage();
    resetToUpload();
    state.result = null;
    state.ocrText = '';
    // Restore all sections
    $('#hero-section').classList.remove('hidden');
    $('#how-it-works-section').classList.remove('hidden');
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== PARTICLE BACKGROUND ======
function initParticles() {
    const canvas = $('#particles-canvas');
    // Canvas is hidden in the light GoI theme — skip drawing to save CPU
    if (!canvas || canvas.style.display === 'none' || getComputedStyle(canvas).display === 'none') return;
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
