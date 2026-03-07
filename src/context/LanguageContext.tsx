"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi" | "pa" | "ta" | "bn";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// A sleek, minimal dictionary covering the Customer UI journey
const DICTIONARY: Translations = {
  welcomeHeader: {
    en: "What do you need help with?",
    hi: "हम आपकी क्या मदद कर सकते हैं?",
    pa: "ਅਸੀਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?",
    ta: "உங்களுக்கு என்ன உதவி தேவை?",
    bn: "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?"
  },
  selectService: {
    en: "Select a service to join the queue.",
    hi: "कतार में शामिल होने के लिए एक सेवा चुनें।",
    pa: "ਕਤਾਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋने ਲਈ ਇੱਕ ਸੇਵਾ ਚੁਣੋ।",
    ta: "வரிசையில் சேர ஒரு சேவையைத் தேர்ந்தெடுக்கவும்.",
    bn: "সারিতে যোগ দিতে একটি পরিষেবা নির্বাচন করুন।"
  },
  enterDetails: {
    en: "Enter Your Details",
    hi: "अपना विवरण दर्ज करें",
    pa: "ਆਪਣੇ ਵੇਰਵੇ ਦਾਖਲ ਕਰੋ",
    ta: "உங்கள் விவரங்களை உள்ளிடவும்",
    bn: "আপনার বিবরণ লিখুন"
  },
  notifyDesc: {
    en: "We need this to notify you when it's your turn.",
    hi: "जब आपकी बारी होगी तो हमें आपको सूचित करने के लिए इसकी आवश्यकता होगी।",
    pa: "ਜਦੋਂ ਤੁਹਾਡੀ ਵਾਰੀ ਆਵੇਗੀ ਤਾਂ ਸਾਨੂੰ ਤੁਹਾਨੂੰ ਸੂਚਿਤ ਕਰਨ ਲਈ ਇਸਦੀ ਲੋੜ ਹੋਵੇਗੀ।",
    ta: "உங்கள் முறை வரும்போது உங்களுக்கு அறிவிக்க இது தேவை.",
    bn: "আপনার পালা এলে আপনাকে জানানোর জন্য আমাদের এটি প্রয়োজন।"
  },
  fullName: {
    en: "Full Name",
    hi: "पूरा नाम",
    pa: "ਪੂਰਾ ਨਾਮ",
    ta: "முழு பெயர்",
    bn: "পুরো নাম"
  },
  phone: {
    en: "WhatsApp Number",
    hi: "व्हाट्सएप नंबर",
    pa: "ਵਟਸਐਪ ਨੰਬਰ",
    ta: "வாட்ஸ்அப் எண்",
    bn: "হোয়াটসঅ্যাপ নম্বর"
  },
  confirmJoin: {
    en: "Confirm & Join",
    hi: "पुष्टि करें और जुड़ें",
    pa: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸ਼ਾਮਲ ਹੋਵੋ",
    ta: "உறுதிசெய்து சேரவும்",
    bn: "নিশ্চিত করুন এবং যোগ দিন"
  },
  yourToken: {
    en: "Your Token Number",
    hi: "आपका टोकन नंबर",
    pa: "ਤੁਹਾਡਾ ਟੋਕਨ ਨੰਬਰ",
    ta: "உங்கள் டோக்கன் எண்",
    bn: "আপনার টোকেন নম্বর"
  },
  currentlyServing: {
    en: "Currently Serving",
    hi: "वर्तमान में सेवा कर रहे हैं",
    pa: "ਵਰਤਮਾਨ ਵਿੱਚ ਸੇਵਾ ਕਰ ਰਹੇ ਹਨ",
    ta: "தற்போது சேவை செய்கிறது",
    bn: "বর্তমানে পরিবেশন করা হচ্ছে"
  },
  peopleAhead: {
    en: "people ahead of you",
    hi: "लोग आपसे आगे हैं",
    pa: "ਲੋਕ ਤੁਹਾਡੇ ਤੋਂ ਅੱਗੇ ਹਨ",
    ta: "உங்களுக்கு முன்னால் உள்ளவர்கள்",
    bn: "আপনার সামনে মানুষ"
  },
  estimatedWait: {
    en: "Estimated wait time:",
    hi: "अनुमानित प्रतीक्षा समय:",
    pa: "ਅਨੁਮਾਨਿਤ ਉਡੀਕ ਸਮਾਂ:",
    ta: "மதிப்பிடப்பட்ட காத்திருப்பு நேரம்:",
    bn: "আনুমানিক অপেক্ষার সময়:"
  },
  cancelBtn: {
    en: "Cancel Token",
    hi: "टोकन रद्द करें",
    pa: "ਟੋਕਨ ਰੱਦ ਕਰੋ",
    ta: "டோக்கனை ரத்துசெய்",
    bn: "টোকেন বাতিল করুন"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

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
