import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'te' | 'ta' | 'kn' | 'bn' | 'pa';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  native: string;
  subtitle: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', subtitle: 'सट्टा मटका हिन्दी इंटरफ़ेस' },
  { code: 'en', name: 'English', native: 'English', subtitle: 'Standard English interface' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', subtitle: 'कल्याण व मुंबई मटका मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', subtitle: 'ગુજરાત સટ્ટા મટકા ઇન્ટરફેસ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', subtitle: 'ਪੰਜਾਬ ਮਟਕਾ ਇੰਟਰਫੇਸ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', subtitle: 'తెలుగు మట్కా ఇంటర్ఫేస్' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', subtitle: 'தமிழ் மட்கா இடைமுகம்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', subtitle: 'ಕರ್ನಾಟಕ ಮಟ್ಕಾ ಇಂಟರ್ಫೇಸ್' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', subtitle: 'কলকাতা ও বাংলা মটকা' }
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Brand & Header
    app_name: 'GOLDMATKA',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    guest_user: 'Guest User',
    tap_to_login: 'Tap to Login',
    profile: 'Profile',

    // Quick Actions
    withdraw: 'WITHDRAW',
    add_points: 'ADD POINTS',
    whatsapp: 'WHATSAPP',
    disawar: 'DISAWAR',

    // Market Card
    open_time: 'Open Time',
    close_time: 'Close Time',
    market_open: 'MARKET OPEN',
    market_closed: 'MARKET CLOSED',
    chart: 'CHART',
    play: 'PLAY',
    jodi: 'Jodi',
    panel: 'Panel',
    loading_markets: 'Loading Live Markets...',
    no_markets: 'No markets available right now',

    // Bottom Navigation
    nav_home: 'Home',
    nav_bids: 'My Bids',
    nav_funds: 'Funds',
    nav_bank: 'Bank',
    nav_support: 'Support',

    // Drawer Menu
    menu_home: 'Home',
    menu_profile: 'Profile',
    menu_game_rates: 'Game Rates',
    menu_how_to_play: 'How to Play',
    menu_winning_history: 'Winning History',
    menu_bid_history: 'Bid History',
    menu_passbook: 'Passbook',
    menu_panel_chart: 'Panel Chart',
    menu_latest_app: 'Download App',
    menu_languages: 'Languages',
    menu_referral: 'Referral',
    menu_logout: 'Logout',
    menu_login_reg: 'Login / Register',

    // Result & Chart Screen
    live_results_chart: 'LIVE RESULTS & CHART',
    refresh: 'REFRESH',
    loading_results: 'Loading Live Markets & Results...',
    select_language: 'SELECT LANGUAGE / भाषा चुनें',
    choose_language: 'Choose your preferred display language for GoldMatka:',
    lang_changed_toast: 'Language changed to English successfully!',
    market_closed_msg: 'Market is closed for betting right now!'
  },

  hi: {
    // Brand & Header
    app_name: 'GOLDMATKA',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    guest_user: 'अतिथि खिलाड़ी',
    tap_to_login: 'लॉगिन करने के लिए टैप करें',
    profile: 'प्रोफ़ाइल',

    // Quick Actions
    withdraw: 'पैसे निकालें',
    add_points: 'पॉइंट्स जोड़ें',
    whatsapp: 'व्हाट्सएप',
    disawar: 'दिसावर',

    // Market Card
    open_time: 'ओपन टाइम',
    close_time: 'क्लोज टाइम',
    market_open: 'मार्केट चालू है',
    market_closed: 'मार्केट बंद है',
    chart: 'चार्ट',
    play: 'खेलें',
    jodi: 'जोड़ी',
    panel: 'पैनल',
    loading_markets: 'लाइव मार्केट लोड हो रहे हैं...',
    no_markets: 'अभी कोई मार्केट उपलब्ध नहीं है',

    // Bottom Navigation
    nav_home: 'होम',
    nav_bids: 'मेरी बोलियां',
    nav_funds: 'फंड्स',
    nav_bank: 'बैंक',
    nav_support: 'सहायता',

    // Drawer Menu
    menu_home: 'होम',
    menu_profile: 'प्रोफ़ाइल',
    menu_game_rates: 'गेम रेट्स',
    menu_how_to_play: 'कैसे खेलें',
    menu_winning_history: 'जीतने का इतिहास',
    menu_bid_history: 'बोली इतिहास',
    menu_passbook: 'पासबुक',
    menu_panel_chart: 'पैनल चार्ट',
    menu_latest_app: 'ऐप डाउनलोड करें',
    menu_languages: 'भाषा बदलें',
    menu_referral: 'रेफर करें और कमाएं',
    menu_logout: 'लॉगआउट',
    menu_login_reg: 'लॉगिन / रजिस्टर',

    // Result & Chart Screen
    live_results_chart: 'लाइव रिजल्ट्स एवं चार्ट',
    refresh: 'रिफ्रेश',
    loading_results: 'लाइव रिजल्ट्स लोड हो रहे हैं...',
    select_language: 'भाषा चुनें / SELECT LANGUAGE',
    choose_language: 'गोल्डमटका के लिए अपनी पसंदीदा भाषा चुनें:',
    lang_changed_toast: 'सफलतापूर्वक हिन्दी भाषा चुनी गई!',
    market_closed_msg: 'यह मार्केट अभी बंद है!'
  },

  mr: {
    // Marathi
    app_name: 'GOLDMATKA',
    login: 'लॉगिन',
    register: 'नोंदणी',
    logout: 'बाहेर पडा',
    guest_user: 'अतिथी खेळाडू',
    tap_to_login: 'लॉगिन करण्यासाठी टॅप करा',
    profile: 'प्रोफाइल',

    withdraw: 'पैसे काढा',
    add_points: 'पॉइंट जोडा',
    whatsapp: 'व्हॉट्सॲप',
    disawar: 'दिसावर',

    open_time: 'ओपन वेळ',
    close_time: 'क्लोज वेळ',
    market_open: 'मार्केट सुरू आहे',
    market_closed: 'मार्केट बंद आहे',
    chart: 'चार्ट',
    play: 'खेळा',
    jodi: 'जोडी',
    panel: 'पॅनेल',
    loading_markets: 'मार्केट्स लोड होत आहेत...',
    no_markets: 'सध्या कोणतेही मार्केट उपलब्ध नाही',

    nav_home: 'मुख्य',
    nav_bids: 'माझ्या बोली',
    nav_funds: 'निधी',
    nav_bank: 'बँक',
    nav_support: 'सपोर्ट',

    menu_home: 'मुख्य पान',
    menu_profile: 'प्रोफाइल',
    menu_game_rates: 'गेम रेट्स',
    menu_how_to_play: 'कसे खेळावे',
    menu_winning_history: 'विजेते इतिहास',
    menu_bid_history: 'बोली इतिहास',
    menu_passbook: 'पासबुक',
    menu_panel_chart: 'पॅनेल चार्ट',
    menu_latest_app: 'ॲप डाउनलोड करा',
    menu_languages: 'भाषा निवडा',
    menu_referral: 'रेफरल',
    menu_logout: 'बाहेर पडा',
    menu_login_reg: 'लॉगिन / नोंदणी',

    live_results_chart: 'थेट निकाल आणि चार्ट',
    refresh: 'रिफ्रेश',
    loading_results: 'थेट निकाल लोड होत आहेत...',
    select_language: 'भाषा निवडा',
    choose_language: 'आपली पसंतीची भाषा निवडा:',
    lang_changed_toast: 'मराठी भाषा निवडली गेली!',
    market_closed_msg: 'हे मार्केट सध्या बंद आहे!'
  },

  gu: {
    // Gujarati
    app_name: 'GOLDMATKA',
    login: 'લોગિન',
    register: 'નોંધણી',
    logout: 'લૉગઆઉટ',
    guest_user: 'મહેમાન વપરાશકર્તા',
    tap_to_login: 'લોગિન કરવા માટે ટેપ કરો',
    profile: 'પ્રોફાઇલ',

    withdraw: 'પૈસા ઉપાડો',
    add_points: 'પોઇન્ટ ઉમેરો',
    whatsapp: 'વોટ્સએપ',
    disawar: 'દિશાવર',

    open_time: 'ઓપન સમય',
    close_time: 'ક્લોઝ સમય',
    market_open: 'માર્કેટ ચાલુ છે',
    market_closed: 'માર્કેટ બંધ છે',
    chart: 'ચાર્ટ',
    play: 'રમો',
    jodi: 'જોડી',
    panel: 'પેનલ',
    loading_markets: 'માર્કેટ્સ લોડ થઈ રહ્યાં છે...',
    no_markets: 'હાલમાં કોઈ માર્કેટ ઉપલબ્ધ નથી',

    nav_home: 'હોમ',
    nav_bids: 'મારી બોલી',
    nav_funds: 'ફંડ્સ',
    nav_bank: 'બેંક',
    nav_support: 'સપોર્ટ',

    menu_home: 'હોમ',
    menu_profile: 'પ્રોફાઇલ',
    menu_game_rates: 'ગેમ રેટ્સ',
    menu_how_to_play: 'કેવી રીતે રમવું',
    menu_winning_history: 'જીતેલા ઇતિહાસ',
    menu_bid_history: 'બોલી ઇતિહાસ',
    menu_passbook: 'પાસબુક',
    menu_panel_chart: 'પેનલ ચાર્ટ',
    menu_latest_app: 'એપ ડાઉનલોડ કરો',
    menu_languages: 'ભાષા પસંદ કરો',
    menu_referral: 'રેફરલ',
    menu_logout: 'લૉગઆઉટ',
    menu_login_reg: 'લોગિન / રજીસ્ટર',

    live_results_chart: 'લાઈવ પરિણામો અને ચાર્ટ',
    refresh: 'રીફ્રેશ',
    loading_results: 'લાઈવ પરિણામો લોડ થઈ રહ્યાં છે...',
    select_language: 'ભાષા પસંદ કરો',
    choose_language: 'તમારી પસંદગીની ભાષા પસંદ કરો:',
    lang_changed_toast: 'ગુજરાતી ભાષા પસંદ કરવામાં આવી!',
    market_closed_msg: 'આ માર્કેટ હાલમાં બંધ છે!'
  },

  pa: {
    // Punjabi
    app_name: 'GOLDMATKA',
    login: 'ਲਾਗਇਨ',
    register: 'ਰਜਿਸਟਰ',
    logout: 'ਲਾਗਆਉਟ',
    guest_user: 'ਮਹਿਮਾਨ ਖਿਡਾਰੀ',
    tap_to_login: 'ਲਾਗਇਨ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',

    withdraw: 'ਪੈਸੇ ਕਢਵਾਓ',
    add_points: 'ਪੁਆਇੰਟ ਸ਼ਾਮਲ ਕਰੋ',
    whatsapp: 'ਵਟਸਐਪ',
    disawar: 'ਦਿਸਾਵਰ',

    open_time: 'ਖੁੱਲ੍ਹਣ ਦਾ ਸਮਾਂ',
    close_time: 'ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ',
    market_open: 'ਮਾਰਕੀਟ ਖੁੱਲ੍ਹੀ ਹੈ',
    market_closed: 'ਮਾਰਕੀਟ ਬੰਦ ਹੈ',
    chart: 'ਚਾਰਟ',
    play: 'ਖੇਡੋ',
    jodi: 'ਜੋੜੀ',
    panel: 'ਪੈਨਲ',
    loading_markets: 'ਮਾਰਕੀਟ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    no_markets: 'ਇਸ ਵੇਲੇ ਕੋਈ ਮਾਰਕੀਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ',

    nav_home: 'ਘਰ',
    nav_bids: 'ਮੇਰੀਆਂ ਬੋਲੀਆਂ',
    nav_funds: 'ਫੰਡ',
    nav_bank: 'ਬੈਂਕ',
    nav_support: 'ਸਹਾਇਤਾ',

    menu_home: 'ਘਰ',
    menu_profile: 'ਪ੍ਰੋਫਾਈਲ',
    menu_game_rates: 'ਗੇਮ ਰੇਟ',
    menu_how_to_play: 'ਕਿਵੇਂ ਖੇਡਣਾ ਹੈ',
    menu_winning_history: 'ਜਿੱਤਣ ਦਾ ਇਤਿਹਾਸ',
    menu_bid_history: 'ਬੋਲੀ ਦਾ ਇਤਿਹਾਸ',
    menu_passbook: 'ਪਾਸਬੁੱਕ',
    menu_panel_chart: 'ਪੈਨਲ ਚਾਰਟ',
    menu_latest_app: 'ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ',
    menu_languages: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    menu_referral: 'ਰੈਫਰਲ',
    menu_logout: 'ਲਾਗਆਉਟ',
    menu_login_reg: 'ਲਾਗਇਨ / ਰਜਿਸਟਰ',

    live_results_chart: 'ਲਾਈਵ ਨਤੀਜੇ ਅਤੇ ਚਾਰਟ',
    refresh: 'ਰੀਫ੍ਰੈਸ਼',
    loading_results: 'ਲਾਈਵ ਨਤੀਜੇ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
    select_language: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    choose_language: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ:',
    lang_changed_toast: 'ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਚੁਣੀ ਗਈ!',
    market_closed_msg: 'ਇਹ ਮਾਰਕੀਟ ਹੁਣ ਬੰਦ ਹੈ!'
  },

  te: {
    // Telugu
    app_name: 'GOLDMATKA',
    login: 'లాగిన్',
    register: 'రిజిస్టర్',
    logout: 'లాగౌట్',
    guest_user: 'గెస్ట్ యూజర్',
    tap_to_login: 'లాగిన్ చేయడానికి నొక్కండి',
    profile: 'ప్రొఫైల్',

    withdraw: 'డబ్బు విత్‌డ్రా',
    add_points: 'పాయింట్లు జోడించండి',
    whatsapp: 'వాట్సాప్',
    disawar: 'దిసావర్',

    open_time: 'ఓపెన్ సమయం',
    close_time: 'క్లోజ్ సమయం',
    market_open: 'మార్కెట్ ఓపెన్',
    market_closed: 'మార్కెట్ క్లోజ్',
    chart: 'చార్ట్',
    play: 'ఆడండి',
    jodi: 'జోడీ',
    panel: 'ప్యానెల్',
    loading_markets: 'మార్కెట్లు లోడ్ అవుతున్నాయి...',
    no_markets: 'ప్రస్తుతం మార్కెట్లు అందుబాటులో లేవు',

    nav_home: 'హోమ్',
    nav_bids: 'నా బిడ్స్',
    nav_funds: 'నిధులు',
    nav_bank: 'బ్యాంక్',
    nav_support: 'సపోర్ట్',

    menu_home: 'హోమ్',
    menu_profile: 'ప్రొఫైల్',
    menu_game_rates: 'గేమ్ రేట్లు',
    menu_how_to_play: 'ఎలా ఆడాలి',
    menu_winning_history: 'గెలుపు చరిత్ర',
    menu_bid_history: 'బిడ్ చరిత్ర',
    menu_passbook: 'పాస్‌బుక్',
    menu_panel_chart: 'ప్యానెల్ చార్ట్',
    menu_latest_app: 'యాప్ డౌన్‌లోడ్',
    menu_languages: 'భాషను ఎంచుకోండి',
    menu_referral: 'రిఫరల్',
    menu_logout: 'లాగౌట్',
    menu_login_reg: 'లాగిన్ / రిజిస్టర్',

    live_results_chart: 'లైవ్ ఫలితాలు & చార్ట్',
    refresh: 'రీఫ్రెష్',
    loading_results: 'ఫలితాలు లోడ్ అవుతున్నాయి...',
    select_language: 'భాషను ఎంచుకోండి',
    choose_language: 'మీ భాషను ఎంచుకోండి:',
    lang_changed_toast: 'తెలుగు భాష ఎంపికైంది!',
    market_closed_msg: 'ఈ మార్కెట్ ప్రస్తుతం మూసివేయబడింది!'
  },

  ta: {
    // Tamil
    app_name: 'GOLDMATKA',
    login: 'உள்நுழைக',
    register: 'பதிவுசெய்க',
    logout: 'வெளியேறு',
    guest_user: 'விருந்தினர்',
    tap_to_login: 'உள்நுழைய தட்டவும்',
    profile: 'சுயவிவரம்',

    withdraw: 'பணம் எடு',
    add_points: 'புள்ளிகள் சேர்',
    whatsapp: 'வாட்ஸ்அப்',
    disawar: 'திசாவர்',

    open_time: 'திறக்கும் நேரம்',
    close_time: 'மூடும் நேரம்',
    market_open: 'சந்தை திறந்துள்ளது',
    market_closed: 'சந்தை மூடப்பட்டது',
    chart: 'சார்ட்',
    play: 'விளையாடு',
    jodi: 'ஜோடி',
    panel: 'பேனல்',
    loading_markets: 'சந்தைகள் ஏற்றப்படுகின்றன...',
    no_markets: 'தற்போது சந்தைகள் கிடைக்கவில்லை',

    nav_home: 'முகப்பு',
    nav_bids: 'என் பந்தயங்கள்',
    nav_funds: 'நிதிகள்',
    nav_bank: 'வங்கி',
    nav_support: 'ஆதரவு',

    menu_home: 'முகப்பு',
    menu_profile: 'சுயவிவரம்',
    menu_game_rates: 'விளையாட்டு விகிதங்கள்',
    menu_how_to_play: 'எப்படி விளையாடுவது',
    menu_winning_history: 'வெற்றி வரலாறு',
    menu_bid_history: 'பந்தய வரலாறு',
    menu_passbook: 'பாஸ்புக்',
    menu_panel_chart: 'பேனல் சார்ட்',
    menu_latest_app: 'ஆப் பதிவிறக்கு',
    menu_languages: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    menu_referral: 'பரிந்துரை',
    menu_logout: 'வெளியேறு',
    menu_login_reg: 'உள்நுழை / பதிவு செய்',

    live_results_chart: 'நேரலை முடிவுகள் & சார்ட்',
    refresh: 'புதுப்பி',
    loading_results: 'முடிவுகள் ஏற்றப்படுகின்றன...',
    select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    choose_language: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:',
    lang_changed_toast: 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது!',
    market_closed_msg: 'இந்த சந்தை தற்போது மூடப்பட்டுள்ளது!'
  },

  kn: {
    // Kannada
    app_name: 'GOLDMATKA',
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    logout: 'ಲಾಗ್‌ಔಟ್',
    guest_user: 'ಅತಿಥಿ ಬಳಕೆದಾರ',
    tap_to_login: 'ಲಾಗಿನ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    profile: 'ಪ್ರೊಫೈಲ್',

    withdraw: 'ಹಣ ಹಿಂಪಡೆಯಿರಿ',
    add_points: 'ಪಾಯಿಂಟ್ಸ್ ಸೇರಿಸಿ',
    whatsapp: 'ವಾಟ್ಸಾಪ್',
    disawar: 'ದಿಸಾವರ್',

    open_time: 'ತೆರೆಯುವ ಸಮಯ',
    close_time: 'ಮುಚ್ಚುವ ಸಮಯ',
    market_open: 'ಮಾರುಕಟ್ಟೆ ತೆರೆದಿದೆ',
    market_closed: 'ಮಾರುಕಟ್ಟೆ ಮುಚ್ಚಿದೆ',
    chart: 'ಚಾರ್ಟ್',
    play: 'ಆಡಿ',
    jodi: 'ಜೋಡಿ',
    panel: 'ಪ್ಯಾನೆಲ್',
    loading_markets: 'ಮಾರುಕಟ್ಟೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    no_markets: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಮಾರುಕಟ್ಟೆ ಲಭ್ಯವಿಲ್ಲ',

    nav_home: 'ಮುಖಪುಟ',
    nav_bids: 'ನನ್ನ ಬಿಡ್ಸ್',
    nav_funds: 'ನಿಧಿಗಳು',
    nav_bank: 'ಬ್ಯಾಂಕ್',
    nav_support: 'ಬೆಂಬಲ',

    menu_home: 'ಮುಖಪುಟ',
    menu_profile: 'ಪ್ರೊಫೈಲ್',
    menu_game_rates: 'ಆಟದ ದರಗಳು',
    menu_how_to_play: 'ಹೇಗೆ ಆಡುವುದು',
    menu_winning_history: 'ಗೆಲುವಿನ ಇತಿಹಾಸ',
    menu_bid_history: 'ಬಿಡ್ ಇತಿಹಾಸ',
    menu_passbook: 'ಪಾಸ್‌ಬುಕ್',
    menu_panel_chart: 'ಪ್ಯಾನೆಲ್ ಚಾರ್ಟ್',
    menu_latest_app: 'ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್',
    menu_languages: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    menu_referral: 'ರೆಫರಲ್',
    menu_logout: 'ಲಾಗ್‌ಔಟ್',
    menu_login_reg: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',

    live_results_chart: 'ಲೈವ್ ಫಲಿತಾಂಶಗಳು & ಚಾರ್ಟ್',
    refresh: 'ರಿಫ್ರೆಶ್',
    loading_results: 'ಫಲಿತಾಂಶಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    select_language: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    choose_language: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
    lang_changed_toast: 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ!',
    market_closed_msg: 'ಈ ಮಾರುಕಟ್ಟೆ ಪ್ರಸ್ತುತ ಮುಚ್ಚಿದೆ!'
  },

  bn: {
    // Bengali
    app_name: 'GOLDMATKA',
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    guest_user: 'অতিথি ব্যবহারকারী',
    tap_to_login: 'লগইন করতে ট্যাপ করুন',
    profile: 'প্রোফাইল',

    withdraw: 'টাকা তুলুন',
    add_points: 'পয়েন্ট যোগ করুন',
    whatsapp: 'হোয়াটসঅ্যাপ',
    disawar: 'দিসাওয়ার',

    open_time: 'খোলার সময়',
    close_time: 'বন্ধের সময়',
    market_open: 'মার্কেট খোলা আছে',
    market_closed: 'মার্কেট বন্ধ আছে',
    chart: 'চার্ট',
    play: 'খেলুন',
    jodi: 'জোড়ি',
    panel: 'প্যানেল',
    loading_markets: 'মার্কেট লোড হচ্ছে...',
    no_markets: 'বর্তমানে কোনো মার্কেট উপলব্ধ নেই',

    nav_home: 'হোম',
    nav_bids: 'আমার বাজি',
    nav_funds: 'তহবিল',
    nav_bank: 'ব্যাংক',
    nav_support: 'সহায়তা',

    menu_home: 'হোম',
    menu_profile: 'প্রোফাইল',
    menu_game_rates: 'খেলার রেট',
    menu_how_to_play: 'কিভাবে খেলবেন',
    menu_winning_history: 'জয়ের ইতিহাস',
    menu_bid_history: 'বাজির ইতিহাস',
    menu_passbook: 'পাসবুক',
    menu_panel_chart: 'প্যানেল চার্ট',
    menu_latest_app: 'অ্যাপ ডাউনলোড',
    menu_languages: 'ভাষা নির্বাচন করুন',
    menu_referral: 'রেফারাল',
    menu_logout: 'লগআউট',
    menu_login_reg: 'লগইন / নিবন্ধন',

    live_results_chart: 'লাইভ ফলাফল এবং চার্ট',
    refresh: 'রিফ্রেশ',
    loading_results: 'লাইভ ফলাফল লোড হচ্ছে...',
    select_language: 'ভাষা নির্বাচন করুন',
    choose_language: 'আপনার পছন্দের ভাষা নির্বাচন করুন:',
    lang_changed_toast: 'বাংলা ভাষা নির্বাচন করা হয়েছে!',
    market_closed_msg: 'এই মার্কেটটি এখন বন্ধ আছে!'
  }
};

// Global helper to get current active language
export function getActiveLanguage(): LanguageCode {
  const saved = localStorage.getItem('goldmatka_lang') || localStorage.getItem('guru777_lang');
  if (saved && saved in TRANSLATIONS) {
    return saved as LanguageCode;
  }
  return 'en';
}

// Global translator function
export function t(key: string, lang?: LanguageCode): string {
  const currentLang = lang || getActiveLanguage();
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

// Set active language and broadcast update event to all components
export function setActiveLanguage(lang: LanguageCode): void {
  localStorage.setItem('goldmatka_lang', lang);
  window.dispatchEvent(new CustomEvent('goldmatka_lang_changed', { detail: { lang } }));
}

// React Hook for dynamic real-time translations across components
export function useLanguage() {
  const [lang, setLang] = useState<LanguageCode>(getActiveLanguage());

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang && e.detail.lang in TRANSLATIONS) {
        setLang(e.detail.lang);
      } else {
        setLang(getActiveLanguage());
      }
    };
    window.addEventListener('goldmatka_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('goldmatka_lang_changed', handleLangChange);
    };
  }, []);

  return {
    lang,
    t: (key: string) => t(key, lang),
    setLanguage: setActiveLanguage
  };
}
