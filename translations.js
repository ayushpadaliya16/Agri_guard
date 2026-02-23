/* ===========================================
   TRANSLATIONS DICTIONARY
   Safety phrases in Indian languages
   =========================================== */

const TRANSLATIONS = {
    // --- Gujarati ---
    gu: {
        langName: "Gujarati",
        langCode: "gu-IN",
        fontFamily: "'Noto Sans Gujarati', sans-serif",

        // UI strings
        ui: {
            product: "ઉત્પાદન",
            mixing: "મિશ્રણ સૂચના",
            safetyGear: "સુરક્ષા સાધનો",
            warning: "ચેતવણી",
            contactDealer: "ડીલરનો સંપર્ક કરો",
            noTextDetected: "કોઈ લખાણ મળ્યું નથી",
        },

        // Safety gear
        gear: {
            gloves: "રબરના હાથમોજાં પહેરો",
            mask: "નાક-મોં ઢાંકો / માસ્ક પહેરો",
            goggles: "આંખ પર ચશ્મા પહેરો",
            boots: "રબરના બૂટ પહેરો",
            apron: "શરીર ઢાંકવા એપ્રોન પહેરો",
            fullBody: "આખું શરીર ઢાંકો"
        },

        // Warning templates
        warnings: {
            extremelyHazardous: "⚠️ ખૂબ જ ખતરનાક ઝેર! બાળકો અને પ્રાણીઓથી દૂર રાખો. સીધો સ્પર્શ ન કરો!",
            highlyHazardous: "⚠️ ખૂબ ખતરનાક! હાથમોજા અને માસ્ક વગર ન વાપરો. ચામડી પર ન પડવા દો!",
            moderatelyHazardous: "⚠️ ખતરનાક દવા. સુરક્ષા સાધનો અને માસ્ક જરૂરી છે.",
            slightlyHazardous: "ℹ️ સાવધાની રાખો. હાથમોજાં પહેરો અને છાંટ્યા પછી હાથ ધોઈ લો.",
            generic: "⚠️ ચેતવણી: આ રાસાયણિક દવા છે. સાવધાની રાખો, સુરક્ષા સાધનો પહેરો!"
        },

        // Dosage template
        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'એમએલ' : 'ગ્રામ'} દવા ${perAmount} ${perUnit === 'liter' ? 'લિટર' : perUnit} પાણીમાં ભેળવો`,

        // Voice template
        voiceTemplate: (productName, warning) =>
            `ધ્યાન આપો! ${productName} ઝેરી દવા છે. ${warning} દવા વાપરતા પહેલાં સુરક્ષા સાધનો ચોક્કસ પહેરો.`
    },

    // --- Hindi ---
    hi: {
        langName: "Hindi",
        langCode: "hi-IN",
        fontFamily: "'Noto Sans Devanagari', sans-serif",

        ui: {
            product: "उत्पाद",
            mixing: "मिश्रण निर्देश",
            safetyGear: "सुरक्षा उपकरण",
            warning: "चेतावनी",
            contactDealer: "डीलर से संपर्क करें",
            noTextDetected: "कोई लेख नहीं मिला",
        },

        gear: {
            gloves: "रबर के दस्ताने पहनें",
            mask: "नाक-मुंह ढकें / मास्क पहनें",
            goggles: "आंखों पर चश्मा पहनें",
            boots: "रबर के जूते पहनें",
            apron: "शरीर ढकने के लिए एप्रोन पहनें",
            fullBody: "पूरा शरीर ढकें"
        },

        warnings: {
            extremelyHazardous: "⚠️ अत्यंत खतरनाक ज़हर! बच्चों और जानवरों से दूर रखें। सीधा स्पर्श न करें!",
            highlyHazardous: "⚠️ बहुत खतरनाक! दस्ताने और मास्क के बिना उपयोग न करें। त्वचा पर न गिरने दें!",
            moderatelyHazardous: "⚠️ खतरनाक दवा। सुरक्षा उपकरण और मास्क ज़रूरी हैं।",
            slightlyHazardous: "ℹ️ सावधानी रखें। दस्ताने पहनें और छिड़काव के बाद हाथ धोएं।",
            generic: "⚠️ चेतावनी: यह रासायनिक दवा है। सावधानी रखें, सुरक्षा उपकरण पहनें!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'एमएल' : 'ग्राम'} दवा ${perAmount} ${perUnit === 'liter' ? 'लीटर' : perUnit} पानी में मिलाएं`,

        voiceTemplate: (productName, warning) =>
            `ध्यान दें! ${productName} ज़हरीली दवा है। ${warning} दवा इस्तेमाल करने से पहले सुरक्षा उपकरण ज़रूर पहनें।`
    },

    // --- Marathi ---
    mr: {
        langName: "Marathi",
        langCode: "mr-IN",
        fontFamily: "'Noto Sans Devanagari', sans-serif",

        ui: {
            product: "उत्पादन",
            mixing: "मिश्रण सूचना",
            safetyGear: "सुरक्षा साधने",
            warning: "इशारा",
            contactDealer: "विक्रेत्याशी संपर्क करा",
            noTextDetected: "कोणताही मजकूर आढळला नाही",
        },

        gear: {
            gloves: "रबरचे हातमोजे घाला",
            mask: "नाक-तोंड झाका / मास्क घाला",
            goggles: "डोळ्यांवर चष्मा घाला",
            boots: "रबरचे बूट घाला",
            apron: "शरीर झाकण्यासाठी एप्रोन घाला",
            fullBody: "पूर्ण शरीर झाका"
        },

        warnings: {
            extremelyHazardous: "⚠️ अत्यंत धोकादायक विष! मुलांपासून आणि प्राण्यांपासून दूर ठेवा. थेट स्पर्श करू नका!",
            highlyHazardous: "⚠️ अत्यंत धोकादायक! हातमोजे आणि मास्कशिवाय वापरू नका. त्वचेवर पडू देऊ नका!",
            moderatelyHazardous: "⚠️ धोकादायक औषध. सुरक्षा साधने आणि मास्क आवश्यक.",
            slightlyHazardous: "ℹ️ काळजी घ्या. हातमोजे घाला आणि फवारणीनंतर हात धुवा.",
            generic: "⚠️ इशारा: हे रासायनिक औषध आहे. काळजी घ्या, सुरक्षा साधने घाला!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'एमएल' : 'ग्रॅम'} औषध ${perAmount} ${perUnit === 'liter' ? 'लिटर' : perUnit} पाण्यात मिसळा`,

        voiceTemplate: (productName, warning) =>
            `लक्ष द्या! ${productName} विषारी औषध आहे. ${warning} औषध वापरण्यापूर्वी सुरक्षा साधने अवश्य घाला.`
    },

    // --- Punjabi ---
    pa: {
        langName: "Punjabi",
        langCode: "pa-IN",
        fontFamily: "'Noto Sans Gurmukhi', sans-serif",

        ui: {
            product: "ਉਤਪਾਦ",
            mixing: "ਮਿਸ਼ਰਣ ਹਦਾਇਤ",
            safetyGear: "ਸੁਰੱਖਿਆ ਸਾਧਨ",
            warning: "ਚੇਤਾਵਨੀ",
            contactDealer: "ਡੀਲਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
            noTextDetected: "ਕੋਈ ਲਿਖਤ ਨਹੀਂ ਮਿਲੀ",
        },

        gear: {
            gloves: "ਰਬੜ ਦੇ ਦਸਤਾਨੇ ਪਾਓ",
            mask: "ਨੱਕ-ਮੂੰਹ ਢੱਕੋ / ਮਾਸਕ ਪਾਓ",
            goggles: "ਅੱਖਾਂ ਉੱਤੇ ਐਨਕ ਪਾਓ",
            boots: "ਰਬੜ ਦੇ ਬੂਟ ਪਾਓ",
            apron: "ਸਰੀਰ ਢੱਕਣ ਲਈ ਐਪਰਨ ਪਾਓ",
            fullBody: "ਪੂਰਾ ਸਰੀਰ ਢੱਕੋ"
        },

        warnings: {
            extremelyHazardous: "⚠️ ਬਹੁਤ ਖ਼ਤਰਨਾਕ ਜ਼ਹਿਰ! ਬੱਚਿਆਂ ਅਤੇ ਜਾਨਵਰਾਂ ਤੋਂ ਦੂਰ ਰੱਖੋ। ਸਿੱਧਾ ਨਾ ਛੂਹੋ!",
            highlyHazardous: "⚠️ ਬਹੁਤ ਖ਼ਤਰਨਾਕ! ਦਸਤਾਨੇ ਅਤੇ ਮਾਸਕ ਤੋਂ ਬਿਨਾਂ ਨਾ ਵਰਤੋ।",
            moderatelyHazardous: "⚠️ ਖ਼ਤਰਨਾਕ ਦਵਾਈ। ਸੁਰੱਖਿਆ ਸਾਧਨ ਅਤੇ ਮਾਸਕ ਜ਼ਰੂਰੀ ਹਨ।",
            slightlyHazardous: "ℹ️ ਸਾਵਧਾਨੀ ਰੱਖੋ। ਦਸਤਾਨੇ ਪਾਓ ਅਤੇ ਛਿੜਕਾਅ ਤੋਂ ਬਾਅਦ ਹੱਥ ਧੋਵੋ।",
            generic: "⚠️ ਚੇਤਾਵਨੀ: ਇਹ ਰਸਾਇਣਕ ਦਵਾਈ ਹੈ। ਸਾਵਧਾਨੀ ਰੱਖੋ!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'ਐਮਐਲ' : 'ਗ੍ਰਾਮ'} ਦਵਾਈ ${perAmount} ${perUnit === 'liter' ? 'ਲਿਟਰ' : perUnit} ਪਾਣੀ ਵਿੱਚ ਮਿਲਾਓ`,

        voiceTemplate: (productName, warning) =>
            `ਧਿਆਨ ਦਿਓ! ${productName} ਜ਼ਹਿਰੀਲੀ ਦਵਾਈ ਹੈ। ${warning} ਦਵਾਈ ਵਰਤਣ ਤੋਂ ਪਹਿਲਾਂ ਸੁਰੱਖਿਆ ਸਾਧਨ ਜ਼ਰੂਰ ਪਾਓ।`
    },

    // --- Tamil ---
    ta: {
        langName: "Tamil",
        langCode: "ta-IN",
        fontFamily: "'Noto Sans Tamil', sans-serif",

        ui: {
            product: "பொருள்",
            mixing: "கலவை வழிமுறை",
            safetyGear: "பாதுகாப்பு உபகரணங்கள்",
            warning: "எச்சரிக்கை",
            contactDealer: "விற்பனையாளரை தொடர்பு கொள்ளுங்கள்",
            noTextDetected: "எந்த உரையும் கண்டறியப்படவில்லை",
        },

        gear: {
            gloves: "ரப்பர் கையுறைகள் அணியுங்கள்",
            mask: "மூக்கு-வாயை மூடுங்கள் / முகக்கவசம் அணியுங்கள்",
            goggles: "கண்ணாடி அணியுங்கள்",
            boots: "ரப்பர் காலணிகள் அணியுங்கள்",
            apron: "உடலை மூட ஏப்ரான் அணியுங்கள்",
            fullBody: "முழு உடலையும் மூடுங்கள்"
        },

        warnings: {
            extremelyHazardous: "⚠️ மிகவும் ஆபத்தான விஷம்! குழந்தைகள் மற்றும் விலங்குகளிடம் இருந்து தூரமாக வைக்கவும்!",
            highlyHazardous: "⚠️ மிகவும் ஆபத்தானது! கையுறைகள் மற்றும் முகக்கவசம் இல்லாமல் பயன்படுத்தாதீர்கள்!",
            moderatelyHazardous: "⚠️ ஆபத்தான மருந்து. பாதுகாப்பு உபகரணங்கள் அவசியம்.",
            slightlyHazardous: "ℹ️ கவனமாக இருங்கள். கையுறைகள் அணிந்து தெளித்த பின் கைகளை கழுவுங்கள்.",
            generic: "⚠️ எச்சரிக்கை: இது ரசாயன மருந்து. கவனமாக இருங்கள்!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'மிலி' : 'கிராம்'} மருந்தை ${perAmount} ${perUnit === 'liter' ? 'லிட்டர்' : perUnit} தண்ணீரில் கலக்கவும்`,

        voiceTemplate: (productName, warning) =>
            `கவனம்! ${productName} விஷ மருந்து. ${warning} மருந்தை பயன்படுத்துவதற்கு முன் பாதுகாப்பு உபகரணங்களை அணியுங்கள்.`
    },

    // --- Telugu ---
    te: {
        langName: "Telugu",
        langCode: "te-IN",
        fontFamily: "'Noto Sans Telugu', sans-serif",

        ui: {
            product: "ఉత్పత్తి",
            mixing: "మిశ్రమ సూచన",
            safetyGear: "భద్రత సామగ్రి",
            warning: "హెచ్చరిక",
            contactDealer: "డీలర్‌ని సంప్రదించండి",
            noTextDetected: "ఏ వచనం కనుగొనబడలేదు",
        },

        gear: {
            gloves: "రబ్బరు చేతి తొడుగులు ధరించండి",
            mask: "ముక్కు-నోరు కప్పండి / మాస్క్ ధరించండి",
            goggles: "కళ్ళజోడు ధరించండి",
            boots: "రబ్బరు బూట్లు ధరించండి",
            apron: "శరీరం కప్పడానికి ఏప్రాన్ ధరించండి",
            fullBody: "పూర్తి శరీరం కప్పండి"
        },

        warnings: {
            extremelyHazardous: "⚠️ చాలా ప్రమాదకరమైన విషం! పిల్లలు మరియు జంతువులకు దూరంగా ఉంచండి!",
            highlyHazardous: "⚠️ చాలా ప్రమాదకరం! చేతి తొడుగులు మరియు మాస్క్ లేకుండా ఉపయోగించకండి!",
            moderatelyHazardous: "⚠️ ప్రమాదకరమైన మందు. భద్రత సామగ్రి తప్పనిసరి.",
            slightlyHazardous: "ℹ️ జాగ్రత్తగా ఉండండి. చేతి తొడుగులు ధరించి పిచికారీ తర్వాత చేతులు కడగండి.",
            generic: "⚠️ హెచ్చరిక: ఇది రసాయన మందు. జాగ్రత్తగా ఉండండి!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'ఎమ్ఎల్' : 'గ్రాములు'} మందు ${perAmount} ${perUnit === 'liter' ? 'లీటర్' : perUnit} నీటిలో కలపండి`,

        voiceTemplate: (productName, warning) =>
            `దయచేసి వినండి! ${productName} విషపూరిత మందు. ${warning} మందు ఉపయోగించే ముందు భద్రత సామగ్రి తప్పనిసరిగా ధరించండి.`
    },

    // --- Kannada ---
    kn: {
        langName: "Kannada",
        langCode: "kn-IN",
        fontFamily: "'Noto Sans Kannada', sans-serif",

        ui: {
            product: "ಉತ್ಪನ್ನ",
            mixing: "ಮಿಶ್ರಣ ಸೂಚನೆ",
            safetyGear: "ಸುರಕ್ಷತೆ ಸಾಧನಗಳು",
            warning: "ಎಚ್ಚರಿಕೆ",
            contactDealer: "ಡೀಲರ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ",
            noTextDetected: "ಯಾವುದೇ ಪಠ್ಯ ಕಂಡುಬಂದಿಲ್ಲ",
        },

        gear: {
            gloves: "ರಬ್ಬರ್ ಕೈಗವಸು ಧರಿಸಿ",
            mask: "ಮೂಗು-ಬಾಯಿ ಮುಚ್ಚಿ / ಮಾಸ್ಕ್ ಧರಿಸಿ",
            goggles: "ಕಣ್ಣಡ್ಡ ಧರಿಸಿ",
            boots: "ರಬ್ಬರ್ ಬೂಟ್ ಧರಿಸಿ",
            apron: "ದೇಹ ಮುಚ್ಚಲು ಏಪ್ರನ್ ಧರಿಸಿ",
            fullBody: "ಪೂರ್ಣ ದೇಹ ಮುಚ್ಚಿ"
        },

        warnings: {
            extremelyHazardous: "⚠️ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ವಿಷ! ಮಕ್ಕಳು ಮತ್ತು ಪ್ರಾಣಿಗಳಿಂದ ದೂರವಿಡಿ!",
            highlyHazardous: "⚠️ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ! ಕೈಗವಸು ಮತ್ತು ಮಾಸ್ಕ್ ಇಲ್ಲದೆ ಬಳಸಬೇಡಿ!",
            moderatelyHazardous: "⚠️ ಅಪಾಯಕಾರಿ ಔಷಧ. ಸುರಕ್ಷತೆ ಸಾಧನಗಳು ಅಗತ್ಯ.",
            slightlyHazardous: "ℹ️ ಜಾಗ್ರತೆ ವಹಿಸಿ. ಕೈಗವಸು ಧರಿಸಿ ಮತ್ತು ಸಿಂಪಡಿಸಿದ ನಂತರ ಕೈ ತೊಳೆಯಿರಿ.",
            generic: "⚠️ ಎಚ್ಚರಿಕೆ: ಇದು ರಾಸಾಯನಿಕ ಔಷಧ. ಜಾಗ್ರತೆ ವಹಿಸಿ!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'ಎಮ್ಎಲ್' : 'ಗ್ರಾಂ'} ಔಷಧ ${perAmount} ${perUnit === 'liter' ? 'ಲೀಟರ್' : perUnit} ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ`,

        voiceTemplate: (productName, warning) =>
            `ಗಮನಿಸಿ! ${productName} ವಿಷಕಾರಿ ಔಷಧ. ${warning} ಔಷಧ ಬಳಸುವ ಮೊದಲು ಸುರಕ್ಷತೆ ಸಾಧನಗಳನ್ನು ಖಂಡಿತ ಧರಿಸಿ.`
    },

    // --- Malayalam ---
    ml: {
        langName: "Malayalam",
        langCode: "ml-IN",
        fontFamily: "'Noto Sans Malayalam', sans-serif",

        ui: {
            product: "ഉൽപ്പന്നം",
            mixing: "മിശ്രണ നിർദ്ദേശം",
            safetyGear: "സുരക്ഷാ ഉപകരണങ്ങൾ",
            warning: "മുന്നറിയിപ്പ്",
            contactDealer: "ഡീലറെ ബന്ധപ്പെടുക",
            noTextDetected: "ഒരു ടെക്സ്റ്റും കണ്ടെത്തിയില്ല",
        },

        gear: {
            gloves: "റബ്ബർ കൈയുറകൾ ധരിക്കുക",
            mask: "മൂക്ക്-വായ മൂടുക / മാസ്ക് ധരിക്കുക",
            goggles: "കണ്ണട ധരിക്കുക",
            boots: "റബ്ബർ ബൂട്ട് ധരിക്കുക",
            apron: "ശരീരം മൂടാൻ ഏപ്രൺ ധരിക്കുക",
            fullBody: "മുഴുവൻ ശരീരവും മൂടുക"
        },

        warnings: {
            extremelyHazardous: "⚠️ അത്യന്തം അപകടകരമായ വിഷം! കുട്ടികളിൽ നിന്നും മൃഗങ്ങളിൽ നിന്നും അകറ്റി വയ്ക്കുക!",
            highlyHazardous: "⚠️ വളരെ അപകടകരം! കൈയുറകളും മാസ്ക്കും ഇല്ലാതെ ഉപയോഗിക്കരുത്!",
            moderatelyHazardous: "⚠️ അപകടകരമായ മരുന്ന്. സുരക്ഷാ ഉപകരണങ്ങൾ ആവശ്യമാണ്.",
            slightlyHazardous: "ℹ️ ശ്രദ്ധിക്കുക. കൈയുറകൾ ധരിച്ച് തളിച്ച ശേഷം കൈ കഴുകുക.",
            generic: "⚠️ മുന്നറിയിപ്പ്: ഇത് രാസ മരുന്നാണ്. ശ്രദ്ധിക്കുക!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'എംഎൽ' : 'ഗ്രാം'} മരുന്ന് ${perAmount} ${perUnit === 'liter' ? 'ലിറ്റർ' : perUnit} വെള്ളത്തിൽ ചേർക്കുക`,

        voiceTemplate: (productName, warning) =>
            `ശ്രദ്ധിക്കുക! ${productName} വിഷ മരുന്നാണ്. ${warning} മരുന്ന് ഉപയോഗിക്കുന്നതിന് മുമ്പ് സുരക്ഷാ ഉപകരണങ്ങൾ ധരിക്കുക.`
    },

    // --- Bengali ---
    bn: {
        langName: "Bengali",
        langCode: "bn-IN",
        fontFamily: "'Noto Sans Bengali', sans-serif",

        ui: {
            product: "পণ্য",
            mixing: "মিশ্রণ নির্দেশনা",
            safetyGear: "সুরক্ষা সরঞ্জাম",
            warning: "সতর্কতা",
            contactDealer: "ডিলারের সাথে যোগাযোগ করুন",
            noTextDetected: "কোনো লেখা পাওয়া যায়নি",
        },

        gear: {
            gloves: "রাবার দস্তানা পরুন",
            mask: "নাক-মুখ ঢাকুন / মাস্ক পরুন",
            goggles: "চোখে চশমা পরুন",
            boots: "রাবার বুট পরুন",
            apron: "শরীর ঢাকতে এপ্রোন পরুন",
            fullBody: "সম্পূর্ণ শরীর ঢাকুন"
        },

        warnings: {
            extremelyHazardous: "⚠️ অত্যন্ত বিপজ্জনক বিষ! শিশু ও পশু থেকে দূরে রাখুন। সরাসরি স্পর্শ করবেন না!",
            highlyHazardous: "⚠️ অত্যন্ত বিপজ্জনক! দস্তানা ও মাস্ক ছাড়া ব্যবহার করবেন না!",
            moderatelyHazardous: "⚠️ বিপজ্জনক ওষুধ। সুরক্ষা সরঞ্জাম ও মাস্ক আবশ্যক।",
            slightlyHazardous: "ℹ️ সাবধানতা অবলম্বন করুন। দস্তানা পরুন এবং স্প্রে করার পর হাত ধুয়ে নিন।",
            generic: "⚠️ সতর্কতা: এটি রাসায়নিক ওষুধ। সাবধানে ব্যবহার করুন!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'এমএল' : 'গ্রাম'} ওষুধ ${perAmount} ${perUnit === 'liter' ? 'লিটার' : perUnit} জলে মেশান`,

        voiceTemplate: (productName, warning) =>
            `মনোযোগ দিন! ${productName} বিষাক্ত ওষুধ। ${warning} ওষুধ ব্যবহারের আগে সুরক্ষা সরঞ্জাম অবশ্যই পরুন।`
    },

    // --- Odia ---
    or: {
        langName: "Odia",
        langCode: "or-IN",
        fontFamily: "'Noto Sans Oriya', sans-serif",

        ui: {
            product: "ଉତ୍ପାଦ",
            mixing: "ମିଶ୍ରଣ ନିର୍ଦେଶ",
            safetyGear: "ସୁରକ୍ଷା ସାମଗ୍ରୀ",
            warning: "ସତର୍କତା",
            contactDealer: "ଡିଲରଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ",
            noTextDetected: "କୌଣସି ଲେଖା ମିଳିଲା ନାହିଁ",
        },

        gear: {
            gloves: "ରବର ହାତମୋଜା ପିନ୍ଧନ୍ତୁ",
            mask: "ନାକ-ମୁହଁ ଢାକନ୍ତୁ / ମାସ୍କ ପିନ୍ଧନ୍ତୁ",
            goggles: "ଆଖିରେ ଚଷମା ପିନ୍ଧନ୍ତୁ",
            boots: "ରବର ବୁଟ ପିନ୍ଧନ୍ତୁ",
            apron: "ଶରୀର ଢାକିବା ପାଇଁ ଏପ୍ରନ ପିନ୍ଧନ୍ତୁ",
            fullBody: "ସମ୍ପୂର୍ଣ୍ଣ ଶରୀର ଢାକନ୍ତୁ"
        },

        warnings: {
            extremelyHazardous: "⚠️ ଅତ୍ୟନ୍ତ ବିପଜ୍ଜନକ ବିଷ! ପିଲା ଓ ପଶୁଙ୍କଠାରୁ ଦୂରରେ ରଖନ୍ତୁ!",
            highlyHazardous: "⚠️ ଅତି ବିପଜ୍ଜନକ! ହାତମୋଜା ଓ ମାସ୍କ ବିନା ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ!",
            moderatelyHazardous: "⚠️ ବିପଜ୍ଜନକ ଔଷଧ। ସୁରକ୍ଷା ସାମଗ୍ରୀ ଆବଶ୍ୟକ।",
            slightlyHazardous: "ℹ️ ସାବଧାନ ରୁହନ୍ତୁ। ହାତମୋଜା ପିନ୍ଧନ୍ତୁ ଓ ସ୍ପ୍ରେ ପରେ ହାତ ଧୋଇନ୍ତୁ।",
            generic: "⚠️ ସତର୍କତା: ଏହା ରାସାୟନିକ ଔଷଧ। ସାବଧାନରେ ବ୍ୟବହାର କରନ୍ତୁ!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `${amount} ${unit === 'ml' ? 'ଏମଏଲ' : 'ଗ୍ରାମ'} ଔଷଧ ${perAmount} ${perUnit === 'liter' ? 'ଲିଟର' : perUnit} ପାଣିରେ ମିଶାନ୍ତୁ`,

        voiceTemplate: (productName, warning) =>
            `ଧ୍ୟାନ ଦିଅନ୍ତୁ! ${productName} ବିଷାକ୍ତ ଔଷଧ। ${warning} ଔଷଧ ବ୍ୟବହାର ପୂର୍ବରୁ ସୁରକ୍ଷା ସାମଗ୍ରୀ ନିଶ୍ଚିତ ଭାବରେ ପିନ୍ଧନ୍ତୁ।`
    },

    // --- English ---
    en: {
        langName: "English",
        langCode: "en-IN",
        fontFamily: "'Inter', sans-serif",

        ui: {
            product: "Product",
            mixing: "Mixing Instructions",
            safetyGear: "Safety Equipment",
            warning: "Warning",
            contactDealer: "Contact your dealer",
            noTextDetected: "No text detected",
            noInfo: "---"
        },

        gear: {
            gloves: "Wear rubber gloves",
            mask: "Cover nose & mouth / wear mask",
            goggles: "Wear safety goggles",
            boots: "Wear rubber boots",
            apron: "Wear apron to cover body",
            fullBody: "Cover full body"
        },

        warnings: {
            extremelyHazardous: "⚠️ EXTREMELY HAZARDOUS POISON! Keep away from children and animals. Do not touch directly!",
            highlyHazardous: "⚠️ HIGHLY HAZARDOUS! Do not use without gloves and mask. Do not let it touch skin!",
            moderatelyHazardous: "⚠️ HAZARDOUS chemical. Safety equipment and mask are required.",
            slightlyHazardous: "ℹ️ Use with caution. Wear gloves and wash hands after spraying.",
            generic: "⚠️ WARNING: This is a chemical pesticide. Use with caution and wear safety equipment!"
        },

        dosageTemplate: (amount, unit, perAmount, perUnit) =>
            `Mix ${amount} ${unit === 'ml' ? 'ml' : 'grams'} of pesticide in ${perAmount} ${perUnit === 'liter' ? 'liters' : perUnit} of water`,

        voiceTemplate: (productName, warning) =>
            `Attention! ${productName} is a toxic pesticide. ${warning} Always wear safety equipment before using this pesticide.`
    }
};


