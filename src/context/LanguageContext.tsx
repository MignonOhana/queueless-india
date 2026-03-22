"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi" | "ta" | "te" | "mr" | "pa" | "bn";

export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिन्दी", english: "Hindi" },
  ta: { native: "தமிழ்", english: "Tamil" },
  te: { native: "తెలుగు", english: "Telugu" },
  mr: { native: "मराठी", english: "Marathi" },
  pa: { native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  bn: { native: "বাংলা", english: "Bengali" },
};

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const DICTIONARY: Translations = {
  // --- Common ---
  welcomeHeader: {
    en: "What do you need help with?",
    hi: "हम आपकी क्या मदद कर सकते हैं?",
    pa: "ਅਸੀਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?",
    ta: "உங்களுக்கு என்ன உதவி தேவை?",
    te: "మీకు ఏ సహాయం కావాలి?",
    mr: "आम्ही तुमची कशी मदत करू शकतो?",
    bn: "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?"
  },
  selectService: {
    en: "Select a service to join the queue.",
    hi: "कतार में शामिल होने के लिए एक सेवा चुनें।",
    pa: "ਕਤਾਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਇੱਕ ਸੇਵਾ ਚੁਣੋ।",
    ta: "வரிசையில் சேர ஒரு சேவையைத் தேர்ந்தெடுக்கவும்.",
    te: "క్యూలో చేరడానికి ఒక సేవను ఎంచుకోండి.",
    mr: "रांगेत सामील होण्यासाठी एक सेवा निवडा.",
    bn: "সারিতে যোগ দিতে একটি পরিষেবা নির্বাচন করুন।"
  },
  enterDetails: {
    en: "Enter Your Details",
    hi: "अपना विवरण दर्ज करें",
    pa: "ਆਪਣੇ ਵੇਰਵੇ ਦਾਖਲ ਕਰੋ",
    ta: "உங்கள் விவரங்களை உள்ளிடவும்",
    te: "మీ వివరాలను నమోదు చేయండి",
    mr: "तुमचे तपशील प्रविष्ट करा",
    bn: "আপনার বিবরণ লিখুন"
  },
  notifyDesc: {
    en: "We need this to notify you when it's your turn.",
    hi: "जब आपकी बारी होगी तो हमें आपको सूचित करने के लिए इसकी आवश्यकता होगी।",
    pa: "ਜਦੋਂ ਤੁਹਾਡੀ ਵਾਰੀ ਆਵੇਗੀ ਤਾਂ ਸਾਨੂੰ ਤੁਹਾਨੂੰ ਸੂਚਿਤ ਕਰਨ ਲਈ ਇਸਦੀ ਲੋੜ ਹੋਵੇਗੀ।",
    ta: "உங்கள் முறை வரும்போது உங்களுக்கு அறிவிக்க இது தேவை.",
    te: "మీ వంతు వచ్చినప్పుడు మిమ్మల్ని తెలియజేయడానికి ఇది అవసరం.",
    mr: "तुमची पाळी आल्यावर तुम्हाला सूचित करण्यासाठी हे आवश्यक आहे.",
    bn: "আপনার পালা এলে আপনাকে জানানোর জন্য আমাদের এটি প্রয়োজন।"
  },
  fullName: {
    en: "Full Name",
    hi: "पूरा नाम",
    pa: "ਪੂਰਾ ਨਾਮ",
    ta: "முழு பெயர்",
    te: "పూర్తి పేరు",
    mr: "पूर्ण नाव",
    bn: "পুরো নাম"
  },
  phone: {
    en: "WhatsApp Number",
    hi: "व्हाट्सएप नंबर",
    pa: "ਵਟਸਐਪ ਨੰਬਰ",
    ta: "வாட்ஸ்அப் எண்",
    te: "WhatsApp నంబర్",
    mr: "WhatsApp नंबर",
    bn: "হোয়াটসঅ্যাপ নম্বর"
  },
  confirmJoin: {
    en: "Confirm & Join",
    hi: "पुष्टि करें और जुड़ें",
    pa: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸ਼ਾਮਲ ਹੋਵੋ",
    ta: "உறுதிசெய்து சேரவும்",
    te: "నిర్ధారించి చేరండి",
    mr: "पुष्टी करा आणि सामील व्हा",
    bn: "নিশ্চিত করুন এবং যোগ দিন"
  },

  // --- Queue Status ---
  joinQueue: {
    en: "Join Queue",
    hi: "कतार में शामिल हों",
    pa: "ਕਤਾਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    ta: "வரிசையில் சேரவும்",
    te: "క్యూలో చేరండి",
    mr: "रांगेत सामील व्हा",
    bn: "সারিতে যোগ দিন"
  },
  yourToken: {
    en: "Your Token Number",
    hi: "आपका टोकन नंबर",
    pa: "ਤੁਹਾਡਾ ਟੋਕਨ ਨੰਬਰ",
    ta: "உங்கள் டோக்கன் எண்",
    te: "మీ టోకన్ నంబర్",
    mr: "तुमचा टोकन क्रमांक",
    bn: "আপনার টোকেন নম্বর"
  },
  waitTime: {
    en: "Wait Time",
    hi: "प्रतीक्षा समय",
    pa: "ਉਡੀਕ ਸਮਾਂ",
    ta: "காத்திருப்பு நேரம்",
    te: "వేచి ఉండే సమయం",
    mr: "प्रतीक्षा वेळ",
    bn: "অপেক্ষার সময়"
  },
  position: {
    en: "Position",
    hi: "स्थान",
    pa: "ਸਥਿਤੀ",
    ta: "நிலை",
    te: "స్థానం",
    mr: "स्थान",
    bn: "অবস্থান"
  },
  currentlyServing: {
    en: "Currently Serving",
    hi: "वर्तमान में सेवा हो रही है",
    pa: "ਵਰਤਮਾਨ ਵਿੱਚ ਸੇਵਾ ਕਰ ਰਹੇ ਹਨ",
    ta: "தற்போது சேவை செய்கிறது",
    te: "ప్రస్తుతం సేవ చేస్తోంది",
    mr: "सध्या सेवा सुरू आहे",
    bn: "বর্তমানে পরিবেশন করা হচ্ছে"
  },
  yourTurn: {
    en: "It's your turn!",
    hi: "आपकी बारी आ गई!",
    pa: "ਤੁਹਾਡੀ ਵਾਰੀ ਆ ਗਈ ਹੈ!",
    ta: "உங்கள் முறை வந்துவிட்டது!",
    te: "మీ వంతు వచ్చింది!",
    mr: "तुमची पाळी आली!",
    bn: "আপনার পালা এসেছে!"
  },
  cancelled: {
    en: "Cancelled",
    hi: "रद्द",
    pa: "ਰੱਦ",
    ta: "ரத்துசெய்யப்பட்டது",
    te: "రద్దు చేయబడింది",
    mr: "रद्द",
    bn: "বাতিল"
  },
  served: {
    en: "Served",
    hi: "सेवा हो गई",
    pa: "ਸੇਵਾ ਹੋ ਗਈ",
    ta: "சேவை செய்யப்பட்டது",
    te: "సేవ అందించబడింది",
    mr: "सेवा दिली",
    bn: "পরিবেশিত"
  },
  peopleAhead: {
    en: "people ahead of you",
    hi: "लोग आपसे आगे हैं",
    pa: "ਲੋਕ ਤੁਹਾਡੇ ਤੋਂ ਅੱਗੇ ਹਨ",
    ta: "உங்களுக்கு முன்னால் உள்ளவர்கள்",
    te: "మీ ముందు ఉన్నవారు",
    mr: "तुमच्या पुढे लोक",
    bn: "আপনার সামনে মানুষ"
  },
  estimatedWait: {
    en: "Estimated wait time:",
    hi: "अनुमानित प्रतीक्षा समय:",
    pa: "ਅਨੁਮਾਨਿਤ ਉਡੀਕ ਸਮਾਂ:",
    ta: "மதிப்பிடப்பட்ட காத்திருப்பு நேரம்:",
    te: "అంచనా వేచి ఉండే సమయం:",
    mr: "अंदाजे प्रतीक्षा वेळ:",
    bn: "আনুমানিক অপেক্ষার সময়:"
  },
  cancelBtn: {
    en: "Cancel Token",
    hi: "टोकन रद्द करें",
    pa: "ਟੋਕਨ ਰੱਦ ਕਰੋ",
    ta: "டோக்கனை ரத்துசெய்",
    te: "టోకన్ రద్దు చేయండి",
    mr: "टोकन रद्द करा",
    bn: "টোকেন বাতিল করুন"
  },
  minutes: {
    en: "minutes",
    hi: "मिनट",
    pa: "ਮਿੰਟ",
    ta: "நிமிடங்கள்",
    te: "నిమిషాలు",
    mr: "मिनिटे",
    bn: "মিনিট"
  },

  // --- Navigation ---
  home: {
    en: "Home",
    hi: "होम",
    pa: "ਘਰ",
    ta: "முகப்பு",
    te: "హోమ్",
    mr: "मुख्यपृष्ठ",
    bn: "হোম"
  },
  search: {
    en: "Search",
    hi: "खोजें",
    pa: "ਖੋਜੋ",
    ta: "தேடு",
    te: "వెతకండి",
    mr: "शोधा",
    bn: "অনুসন্ধান"
  },
  profile: {
    en: "Profile",
    hi: "प्रोफ़ाइल",
    pa: "ਪ੍ਰੋਫ਼ਾਈਲ",
    ta: "சுயவிவரம்",
    te: "ప్రొఫైల్",
    mr: "प्रोफाइल",
    bn: "প্রোফাইল"
  },
  language: {
    en: "Language",
    hi: "भाषा",
    pa: "ਭਾਸ਼ਾ",
    ta: "மொழி",
    te: "భాష",
    mr: "भाषा",
    bn: "ভাষা"
  },
  liveStatus: {
    en: "Live Queue Status",
    hi: "लाइव कतार की स्थिति",
    pa: "ਲਾਈਵ ਕਤਾਰ ਦੀ ਸਥਿਤੀ",
    ta: "நேரடி வரிசை நிலை",
    te: "లైవ్ క్యూ స్థితి",
    mr: "थेट रांगेची स्थिती",
    bn: "লাইভ কিউ স্ট্যাটাস"
  },
  yourName: {
    en: "Your Name",
    hi: "आपका नाम",
    pa: "ਤੁਹਾਡਾ ਨਾਮ",
    ta: "உங்கள் பெயர்",
    te: "మీ పేరు",
    mr: "तुमचे नाव",
    bn: "আপনার নাম"
  },
  mobileNumber: {
    en: "Mobile Number",
    hi: "मोबाइल नंबर",
    pa: "ਮੋਬਾਈਲ ਨੰਬਰ",
    ta: "மொபைல் எண்",
    te: "మొబైల్ సంఖ్య",
    mr: "मोबाईल नंबर",
    bn: "মোবাইল নম্বর"
  },
  join: {
    en: "Join",
    hi: "जुड़ें",
    pa: "ਸ਼ਾਮਲ ਹੋਵੋ",
    ta: "சேர்",
    te: "చేరండి",
    mr: "सामील व्हा",
    bn: "যোগ দিন"
  },
  tokenHash: {
    en: "Token #",
    hi: "टोकन #",
    pa: "ਟੋਕਨ #",
    ta: "டோக்கன் #",
    te: "టోకన్ #",
    mr: "टोकन #",
    bn: "টोकেন #"
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language?.split('-')[0] || 'en';
  const supported: Language[] = ['en', 'hi', 'ta', 'te', 'mr', 'pa', 'bn'];
  return supported.includes(browserLang as Language) ? (browserLang as Language) : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load from localStorage or browser on mount
  useEffect(() => {
    const saved = localStorage.getItem('queueless_lang') as Language | null;
    if (saved && ['en', 'hi', 'ta', 'te', 'mr', 'pa', 'bn'].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    } else {
      setLanguageState(detectBrowserLanguage());
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('queueless_lang', lang);
  };

  const t = (key: string): string => {
    if (!DICTIONARY[key]) return key;
    return DICTIONARY[key][language] || DICTIONARY[key]["en"];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
