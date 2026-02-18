/* ===========================================
   CHEMICALS DATABASE (RICH)
   Common Indian pesticides with detailed safety, first aid, and disposal info.
   Sources: CIBRC, WHO, FAO
   =========================================== */

const CHEMICALS_DB = [
    // --- EXTREMELY HAZARDOUS (Red) ---
    {
        name: "Monocrotophos",
        class: "Ia",
        hazard: "EXTREMELY HAZARDOUS",
        aliases: ["monocrotophos", "nuvacron", "azodrin", "phoskill"],
        crops: ["Cotton", "Citrus", "Maize"],
        sideEffects: "Dizziness, sweating, breathing trouble, blurred vision, fainting.",
        firstAid: "Move to fresh air. If swallowed, induce vomiting ONLY if conscious. Wash skin with soap/water. Rush to hospital. Atropine is antidote.",
        disposal: "Crush empty bottle, bury deep in soil away from water sources. Do not burn.",
        precautions: "Wear full protective suit, gloves, mask, and boots. Do not spray against wind.",
        organicAlt: "Neem oil, Pheromone traps"
    },
    {
        name: "Phorate",
        class: "Ia",
        hazard: "EXTREMELY HAZARDOUS",
        aliases: ["phorate", "thimet", "granutox"],
        crops: ["Sugarcane", "Cotton", "Maize"],
        sideEffects: "Nausea, cramps, weakness, paralysis of respiratory muscles.",
        firstAid: "Remove contaminated clothes. Wash eyes with water for 15 mins. Rush to doctor immediately.",
        disposal: "Do not reuse container. Destroy and bury in landfill.",
        precautions: "Do not touch granules with bare hands. Use gloves and applicator.",
        organicAlt: "Trichogramma cards, Biopesticides"
    },
    {
        name: "Dichlorvos (DDVP)",
        class: "Ib",
        hazard: "HIGHLY HAZARDOUS",
        aliases: ["dichlorvos", "ddvp", "nuvan", "doom"],
        crops: ["Vegetables", "Fruit trees"],
        sideEffects: "Headache, vomiting, muscle twitching, convulsions.",
        firstAid: "Give plenty of water. Do not give milk/oil. Artificial respiration if breathing stops. Atropine required.",
        disposal: "Triple rinse container, pour rinse water into tank. Puncture and bury container.",
        precautions: "Use face shield. High vapor pressure - avoid inhaling fumes.",
        organicAlt: "Sticky traps, Light traps"
    },

    // --- HIGHLY HAZARDOUS (Yellow) ---
    {
        name: "Profenofos",
        class: "II",
        hazard: "MODERATELY HAZARDOUS",
        aliases: ["profenofos", "curacron", "celcron"],
        crops: ["Cotton", "Soybean"],
        sideEffects: "Nausea, abdominal pain, diarrhea, salivation.",
        firstAid: "Wash skin immediately. Flush eyes with water. Seek medical help.",
        disposal: "Break bottle and bury away from habitation.",
        precautions: "Wear rubber gloves and mask. Dangerous to fish - do not wash in ponds.",
        organicAlt: "Neem based sprays"
    },
    {
        name: "Cypermethrin",
        class: "II",
        hazard: "MODERATELY HAZARDOUS",
        aliases: ["cypermethrin", "cymbush", "ripcord", "ammo", "super killer"],
        crops: ["Cotton", "Okra", "Brinjal"],
        sideEffects: "Skin burning/itching, numbness (paresthesia), dizziness.",
        firstAid: "Wash skin with soap. Vitamin E oil helps skin burning. Do not induce vomiting if swallowed.",
        disposal: "Burn container in high temp incinerator or bury deep.",
        precautions: "Avoid contact with skin/eyes. Token to bees/fish.",
        organicAlt: "Beauveria bassiana"
    },
    {
        name: "Chlorpyrifos",
        class: "II",
        hazard: "MODERATELY HAZARDOUS",
        aliases: ["chlorpyrifos", "dursban", "lorsban", "classic", "force"],
        crops: ["Rice", "Cotton", "Sugarcane"],
        sideEffects: "Headache, blurred vision, muscle weakness.",
        firstAid: "Remove patient from area. Wash contaminated body parts. Atropine injection by doctor.",
        disposal: "Do not use empty container for food/water. Destroy and bury.",
        precautions: "Highly toxic to birds and fish. Do not spray near water bodies.",
        organicAlt: "Chilli-Garlic extract"
    },
    {
        name: "Imidacloprid",
        class: "II",
        hazard: "MODERATELY HAZARDOUS",
        aliases: ["imidacloprid", "confidor", "gaucho", "admire", "media"],
        crops: ["Cotton", "Paddy", "Chilli"],
        sideEffects: "Apathy, breathing difficulty, tremors, cramps.",
        firstAid: "Symptomatic treatment. No specific antidote. Wash thoroughly.",
        disposal: "Triple rinse and bury in wasteland.",
        precautions: "Toxic to honey bees. Do not spray during flowering season.",
        organicAlt: "Neem oil, Verticillium lecanii"
    },

    // --- SLIGHTLY HAZARDOUS (Blue/Green) ---
    {
        name: "Mancozeb",
        class: "III",
        hazard: "SLIGHTLY HAZARDOUS",
        aliases: ["mancozeb", "dithane", "indofil", "uphane"],
        crops: ["Potato", "Tomato", "Wheat"],
        sideEffects: "Skin irritation, throat irritation.",
        firstAid: "Wash eyes with water. Drink water to dilute. Consult doctor if irritation persists.",
        disposal: "Bury empty packets in soil.",
        precautions: "Wear mask to avoid inhaling dust. Wear gloves.",
        organicAlt: "Trichoderma viride"
    },
    {
        name: "Glyphosate",
        class: "III",
        hazard: "SLIGHTLY HAZARDOUS",
        aliases: ["glyphosate", "roundup", "glycel", "weedoff"],
        crops: ["Non-crop areas", "Tea", "Coffee (Weedicide)"],
        sideEffects: "Eye irritation, skin rash.",
        firstAid: "Flush eyes with water for 15 mins. Wash skin with soap.",
        disposal: "Do not reuse container. Rinse and puncture.",
        precautions: "Avoid spray drift to nearby crops. Wear boots and gloves.",
        organicAlt: "Mulching, Manual weeding"
    },
    {
        name: "Paraquat",
        class: "Ib", // Actually highly hazardous but often used
        hazard: "HIGHLY HAZARDOUS",
        aliases: ["paraquat", "gramoxone", "parazone"],
        crops: ["Weedicide"],
        sideEffects: "Severe lung damage, kidney failure, mouth ulcers.",
        firstAid: "Administer activated charcoal or Fuller's earth immediately. Rush to hospital. Fatal if swallowed.",
        disposal: "Destroy container completely. Do not wash in river.",
        precautions: "Never transfer to soft drink bottles. Fatal mistake!",
        organicAlt: "Salt water spray (mild weeds)"
    }
];

// Safety gear keywords mapping (unchanged, just cleaner)
const GEAR_KEYWORDS = {
    gloves: ["gloves", "hand", "rubber gloves"],
    mask: ["mask", "respirator", "face"],
    goggles: ["goggles", "eye", "glasses"],
    boots: ["boots", "feet", "shoes"],
    apron: ["apron", "body", "suit"]
};

// Common Dosage Patterns for Regex
const DOSAGE_PATTERNS = [
    /(\d+(?:\.\d+)?)\s*(?:ml|g|gm)\s*(?:per|\/)\s*(?:lit|l)/gi, // 5 ml/lit
    /(\d+(?:\.\d+)?)\s*(?:ml|g)\s*(?:per|\/)\s*acre/gi, // 500 ml/acre
    /mix\s*(\d+)\s*(?:ml|g)/gi
];

// DANGER Keywords
const DANGER_KEYWORDS = [
    "poison", "danger", "toxic", "warning", "fatal", "skull", "keep away"
];
