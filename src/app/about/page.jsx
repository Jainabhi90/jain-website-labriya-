"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCMS } from "@/context/CMSContext";
import { 
  History, 
  BookOpen, 
  Award, 
  Users, 
  Compass, 
  Sparkles,
  Clock,
  MapPin,
  Heart,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default function About() {
  const { cms } = useCMS();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
      const syncLang = () => {
        setLang(localStorage.getItem("lang") || "en");
      };
      window.addEventListener("languageChange", syncLang);
      return () => window.removeEventListener("languageChange", syncLang);
    }
  }, []);

  const committee = [
    { name: "Sureshchandra S. Shah", role: "Trust President", term: "Since 2018" },
    { name: "Dr. Kirit Kumar Jain", role: "General Secretary", term: "Since 2020" },
    { name: "Mahendra Kumar Mehta", role: "Treasurer & Accounts", term: "Since 2015" },
    { name: "Rajesh K. Khabia", role: "Chaturmas Coordinator", term: "Volunteer Lead" },
    { name: "Smt. Pushpa D. Kataria", role: "Mahila Mandal Lead", term: "Social welfare" },
    { name: "Nitin P. Doshi", role: "Dharamshala Manager", term: "Facility Head" },
  ];

  const guruLineage = {
    name: "Acharya Dev Shrimad Vijay Rajendrasuri Maharaj",
    title: "Revered Guru & Spiritual Guide",
    bio: "Pujya Gurudev is known for his deep mastery of Jain scriptures and strict adherence to monastic vows. He has traveled thousands of kilometers on barefoot (Vihar) to spread the message of non-violence (Ahimsa) and self-restraint. Under his blessings, the Chaturmas 2026 at Labriya is organized to inspire the youth and nurture traditional values.",
    teachings: [
      "Practice Ahimsa (non-harm) in thoughts, words, and actions.",
      "Cultivate Swadhyay (self-study) to clean internal impurities.",
      "Perform daily Pratikraman (repentance) for spiritual alignment.",
      "Embrace Aparigraha (non-possessiveness) to find true freedom."
    ],
    imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=600&auto=format&fit=crop"
  };

  const jainValues = [
    { name: "Ahimsa (अहिंसा)", desc: lang === "en" ? "Non-violence in thoughts, words, and actions towards all living beings." : "सभी जीवों के प्रति विचारों, वचनों और कार्यों में अहिंसा का पालन।" },
    { name: "Satya (सत्य)", desc: lang === "en" ? "Commitment to truthfulness and speech that is beneficial and pleasant." : "सत्यवादिता के प्रति प्रतिबद्धता और दूसरों के हित में प्रिय वचन बोलना।" },
    { name: "Asteya (अस्तेय)", desc: lang === "en" ? "Non-stealing; refraining from taking anything not given willingly." : "अचौर्य; बिना किसी की इच्छा या अनुमति के किसी भी वस्तु को न लेना।" },
    { name: "Aparigraha (अपरिग्रह)", desc: lang === "en" ? "Non-possessiveness and limitation of desires and worldly items." : "अपरिग्रह; भौतिक इच्छाओं को सीमित करना और अपरिग्रह का अभ्यास करना।" },
    { name: "Anekantavada (अनेकांतवाद)", desc: lang === "en" ? "Pluralism and open-mindedness; respecting diverse perspectives." : "विविध दृष्टिकोणों का सम्मान और सत्य के बहुआयामी स्वरूप को स्वीकारना।" },
    { name: "Brahmacharya (ब्रह्मचर्य)", desc: lang === "en" ? "Self-restraint, chastity, and mindfulness of spiritual boundaries." : "ब्रह्मचर्य; इंद्रिय संयम, शुचिता और आध्यात्मिक सीमाओं का पालन।" }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pt-20 pb-16 flex flex-col items-center">
      
      {/* 1. ABOUT HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center flex flex-col items-center gap-4 relative overflow-hidden">
        {/* Sanskrit Verse Accent */}
        <span className="text-[10px] sm:text-xs font-bold text-[#EA580C] tracking-widest uppercase bg-[#FFF7ED] px-4 py-1.5 rounded-full border border-[#C28A3E]/20 select-none">
          {lang === "en" ? "🌸 Mangalam Bhagwan Viro..." : "🌸 मंगलम् भगवान वीरो, मंगलम् गौतम प्रभु..."}
        </span>
        
        <h1 className="font-display font-bold text-text-primary text-3xl sm:text-4xl md:text-5xl mt-2 leading-tight">
          {cms.templeName || "Shree Labriya Jain Mandir"}
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
          {cms.aboutTempleSummary || "Step into a century-old heritage of spiritual peace, deep devotion, and continuous community service. Guided by revered Gurus, Shree Labriya Mandir stands as a monument of pure dharma."}
        </p>

        {/* Small Mandala Spacer */}
        <div className="flex items-center gap-2 mt-2 select-none">
          <div className="w-8 h-[1px] bg-[#C28A3E]/30" />
          <span className="text-sm text-[#C28A3E]">卐</span>
          <div className="w-8 h-[1px] bg-[#C28A3E]/30" />
        </div>
      </section>

      {/* 2. MAIN NARRATIVE PANELS */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-12 sm:gap-16">
        
        {/* A. TEMPLE STORY TIMELINE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EA580C]/10 w-fit">
              <History className="text-[#EA580C] w-5 h-5" />
              <h2 className="font-display font-bold text-text-primary text-lg sm:text-xl">
                {lang === "en" ? "Historical Story & Architecture" : "ऐतिहासिक गाथा एवं शिल्प"}
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {cms.templeHistory || "Established over a century ago in the quiet, scenic landscapes of Labriya, Madhya Pradesh, Shree Labriya Jain Shwetambar Mandir is a sanctified monument of peace. Dedicated to the Tirthankaras, the temple features intricate marble carvings, domes, and a peaceful environment that naturally invites quietude."}
            </p>
            {cms.aboutText && (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {cms.aboutText}
              </p>
            )}
          </div>

          <div className="md:col-span-5 aspect-[4/3] rounded-custom-lg overflow-hidden border border-[#C28A3E]/20 shadow-premium relative bg-white group select-none">
            <img 
              src={cms.heroBanner || "https://images.unsplash.com/photo-1609137144814-0e31189c445a?q=80&w=800&auto=format&fit=crop"} 
              alt="Temple Banner" 
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* B. MISSION & VISION */}
        {(cms.mission || cms.vision) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {cms.mission && (
              <div className="p-6 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Compass size={16} />
                </div>
                <h3 className="font-display font-bold text-text-primary text-base">
                  {lang === "en" ? "Spiritual Mission" : "आध्यात्मिक उद्देश्य"}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {cms.mission}
                </p>
              </div>
            )}

            {cms.vision && (
              <div className="p-6 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-display font-bold text-text-primary text-base">
                  {lang === "en" ? "Future Vision" : "भावी परिकल्पना"}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {cms.vision}
                </p>
              </div>
            )}
          </div>
        )}

        {/* C. THE CHATURMAS SIGNIFICANCE */}
        <div className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium text-left flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EA580C]/10 w-fit">
            <Calendar className="text-[#C28A3E] w-5 h-5" />
            <h3 className="font-display font-bold text-text-primary text-base sm:text-lg">
              {lang === "en" ? "What is Chaturmas?" : "चातुर्मास की महिमा"}
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {lang === "en"
              ? "Chaturmas (four months) is the holy monsoon retreat when Jain ascetics (Sadhu-Sadhvi) temporarily suspend barefoot vihar to avoid causing harm to tiny micro-organisms that multiply during rains. This period is highly auspicious for devotees to deepen spiritual studies, observe vows, practice meditation, and absorb daily discourses (Pravachan)."
              : "चातुर्मास वर्षा ऋतु के चार महीनों की वह अवधि है जब जैन संत (साधु-साध्वी) सूक्ष्म जीवों की रक्षा हेतु विहार स्थगित कर एक स्थान पर वास करते हैं। यह काल स्वाध्याय, तपस्या, सामायिक और दैनिक प्रवचन श्रवण द्वारा आत्म-कल्याण के लिए अत्यंत श्रेष्ठ माना गया है।"}
          </p>
        </div>

        {/* D. GURU LINEAGE & CHATURMAS TEACHINGS */}
        <div className="p-6 sm:p-8 rounded-custom-lg bg-white border border-[#C28A3E]/20 shadow-premium grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          <div className="lg:col-span-4 flex flex-col items-center text-center gap-4 select-none">
            <div className="w-36 h-36 rounded-full overflow-hidden border border-[#C28A3E]/30 bg-[#FCFBF7] relative shadow-sm">
              <img src={guruLineage.imageUrl} alt={guruLineage.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <h3 className="font-display font-bold text-text-primary text-sm sm:text-base leading-snug">{guruLineage.name}</h3>
              <p className="text-[9px] text-[#C28A3E] uppercase tracking-widest font-bold mt-1">{guruLineage.title}</p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="text-[9.5px] uppercase font-bold text-[#EA580C] tracking-wider leading-none">
              {lang === "en" ? "Lineage Guidance" : "गुरुदेव संदेश"}
            </span>
            
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {guruLineage.bio}
            </p>
            
            <div className="flex flex-col gap-2 pt-3.5 border-t border-[#EA580C]/10">
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#EA580C]" />
                Core Chaturmas Teachings
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 select-none">
                {guruLineage.teachings.map((teaching, i) => (
                  <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5 leading-relaxed font-medium">
                    <span className="text-[#EA580C] shrink-0 mt-0.5">•</span>
                    <span>{teaching}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* E. JAIN PRINCIPLES VALUES */}
        <div className="flex flex-col gap-4 text-left">
          <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Award size={15} className="text-[#C28A3E]" />
            <span>{lang === "en" ? "Jain Values & Conduct" : "मूल जैन सिद्धांत"}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jainValues.map((val, idx) => (
              <div key={idx} className="p-4 rounded-custom-md bg-white border border-[#EA580C]/5 shadow-sm">
                <h4 className="font-semibold text-xs sm:text-sm text-[#1F2937] leading-none mb-1.5">{val.name}</h4>
                <p className="text-[10px] sm:text-[11px] text-text-secondary leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* F. DAILY TEMPLE LIFE TIMINGS */}
        <div className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium text-left flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EA580C]/10 w-fit select-none">
            <Clock className="text-[#EA580C] w-5 h-5" />
            <h3 className="font-display font-bold text-text-primary text-base sm:text-lg">
              {lang === "en" ? "Daily Temple Timings & Rituals" : "दैनिक दर्शन एवं आरती नियम"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-1 text-xs">
            <div className="p-3.5 rounded bg-[#FCFBF7] border border-[#C28A3E]/10">
              <span className="text-[9px] text-[#C28A3E] uppercase font-bold block mb-1">{lang === "en" ? "Morning Puja" : "दैनिक प्रक्षाल/पूजा"}</span>
              <span className="font-bold text-text-primary block">{cms.pujaTiming || "06:30 AM - 08:30 AM"}</span>
            </div>
            <div className="p-3.5 rounded bg-[#FCFBF7] border border-[#C28A3E]/10">
              <span className="text-[9px] text-[#C28A3E] uppercase font-bold block mb-1">{lang === "en" ? "Pravachan Time" : "दैनिक धर्मसभा/प्रवचन"}</span>
              <span className="font-bold text-text-primary block">{cms.officeTiming || "09:00 AM - 10:30 AM"}</span>
            </div>
            <div className="p-3.5 rounded bg-[#FCFBF7] border border-[#C28A3E]/10">
              <span className="text-[9px] text-[#C28A3E] uppercase font-bold block mb-1">{lang === "en" ? "Evening Aarti" : "सन्ध्या आरती"}</span>
              <span className="font-bold text-text-primary block">{cms.aartiTiming || "07:00 PM - 07:45 PM"}</span>
            </div>
            <div className="p-3.5 rounded bg-[#FCFBF7] border border-[#C28A3E]/10">
              <span className="text-[9px] text-[#C28A3E] uppercase font-bold block mb-1">{lang === "en" ? "Darshan Timings" : "सामान्य दर्शन"}</span>
              <span className="font-bold text-text-primary block">{cms.dailyTimings || "06:00 AM - 08:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* G. TRUST INFORMATION & COMMITTEE */}
        <div className="flex flex-col gap-6 text-left">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EA580C]/10 w-fit">
            <Users className="text-[#EA580C] w-5 h-5" />
            <h3 className="font-display font-bold text-text-primary text-lg sm:text-xl">
              {lang === "en" ? "Trust Committee Directory" : "ट्रस्ट प्रबन्धन समिति"}
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            {cms.trustInformation || "The Shree Labriya Jain Trust Committee functions purely as a non-profit volunteer body. Members handle the operational administration of the temple, dharamshala accommodation, bhandara logistics, and chaturmas event management."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {committee.map((member, idx) => (
              <div
                key={idx}
                className="p-5 rounded-custom-md bg-white border border-[#EA580C]/5 shadow-premium flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <h4 className="font-display font-semibold text-text-primary text-sm leading-snug">{member.name}</h4>
                  <p className="text-[9px] text-[#C28A3E] uppercase tracking-widest font-bold mt-1">{member.role}</p>
                </div>
                <span className="text-[10px] text-[#EA580C] font-semibold mt-3 bg-[#FFF7ED] px-2 py-0.5 rounded-custom-sm w-fit border border-[#EA580C]/10">
                  {member.term}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* H. VISIT INFORMATION */}
        <div className="p-6 sm:p-7 rounded-custom-lg bg-[#FCFBF7] border border-[#C28A3E]/20 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#C28A3E]/20 w-fit select-none">
            <MapPin className="text-[#C28A3E] w-5 h-5" />
            <h3 className="font-display font-bold text-text-primary text-base sm:text-lg">
              {lang === "en" ? "Visitor Guidelines & Lodging" : "तीर्थयात्री निर्देश एवं धर्मशाला"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-[#4B5563]">
            <div className="flex flex-col gap-1.5">
              <strong className="text-text-primary">{lang === "en" ? "Dress Code" : "वेशभूषा नियम"}</strong>
              <p className="leading-relaxed">{lang === "en" ? "Devotees are requested to wear clean, traditional Indian attire while entering the main sanctuary for Pujas." : "मुख्य पूजा स्थल में प्रवेश करते समय श्रद्धालुओं से स्वच्छ, पारंपरिक और शालीन परिधान पहनने का अनुरोध है।"}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <strong className="text-text-primary">{lang === "en" ? "Accommodation (Dharamshala)" : "धर्मशाला आवास"}</strong>
              <p className="leading-relaxed">{lang === "en" ? "Rooms and bhojanashala arrangements are open to all devotees. Register via Devotee Portal for room bookings." : "सभी तीर्थयात्रियों के लिए धर्मशाला और भोजनशाला व्यवस्था उपलब्ध है। कमरे बुक करने के लिए भक्त पोर्टल का उपयोग करें।"}</p>
            </div>
          </div>
        </div>

        {/* I. SPIRITUAL QUOTE ENDING */}
        <div className="py-8 border-y border-[#C28A3E]/20 text-center select-none">
          <p className="font-display italic text-[#EA580C] text-lg sm:text-xl font-bold leading-relaxed max-w-xl mx-auto">
            "सच्चं लोगम्मि सारभूयं"
          </p>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-2">
            {lang === "en" ? "Truth is the only essence in this universe" : "इस संसार में केवल सत्य ही शाश्वत सार है"}
          </p>
        </div>

        {/* J. CTA ENDING SECTION */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 select-none">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3.5 rounded-custom-md bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-[#EA580C]/90 active:bg-[#EA580C]/95 transition-all cursor-pointer text-center">
              {lang === "en" ? "Go to Devotee Portal" : "भक्त पोर्टल पर जाएं"}
            </button>
          </Link>
          <Link href="/donate" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3.5 rounded-custom-md border border-[#C28A3E]/20 bg-white text-[#C28A3E] hover:bg-[#FFF7ED]/30 hover:border-[#C28A3E]/40 active:bg-[#FFF7ED]/50 transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer text-center">
              {lang === "en" ? "Make Seva Donation" : "सेवा दान करें"}
            </button>
          </Link>
        </div>

      </section>

    </div>
  );
}
