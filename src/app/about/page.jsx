"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCMS } from "@/context/CMSContext";
import { 
  History, 
  BookOpen, 
  Award, 
  Users, 
  Compass, 
  Sparkles
} from "lucide-react";

export default function About() {
  const { cms } = useCMS();
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-16">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 w-fit mx-auto">
          <BookOpen size={12} />
          Know the Heritage
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          About {cms.templeName || "Shree Labriya Mandir"}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {cms.aboutTempleSummary || "Discover the history, spiritual mission, committee trustees, and holy ascetics guiding the Chaturmas 2026 festival."}
        </p>
      </div>

      <div className="w-full flex flex-col gap-16 max-w-5xl">
        
        {/* 1. HISTORY AND SIGNIFICANCE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-custom w-fit">
              <History className="text-primary w-5 h-5" />
              <h2 className="font-display font-semibold text-text-primary text-xl">
                Historical Scroll
              </h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {cms.templeHistory || "Established over a century ago in the quiet, scenic landscapes of Labriya, Madhya Pradesh, Shree Labriya Jain Shwetambar Mandir is a sanctified monument of peace. Dedicated to the Tirthankaras, the temple features intricate marble carvings, domes, and a peaceful environment that naturally invites quietude."}
            </p>
            {cms.aboutText && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {cms.aboutText}
              </p>
            )}
          </div>

          <div className="md:col-span-5 aspect-[4/3] rounded-custom-lg overflow-hidden border border-border-custom shadow-premium relative bg-secondary">
            <img 
              src={cms.heroBanner || "https://images.unsplash.com/photo-1609137144814-0e31189c445a?q=80&w=800&auto=format&fit=crop"} 
              alt="Temple Banner" 
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* 2. MISSION AND VISION */}
        {(cms.mission || cms.vision || cms.trustInformation) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            <div className="md:col-span-6 flex flex-col gap-4">
              {cms.mission && (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-border-custom w-fit">
                    <Compass className="text-primary w-5 h-5" />
                    <h2 className="font-display font-semibold text-text-primary text-xl">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {cms.mission}
                  </p>
                </>
              )}
            </div>

            <div className="md:col-span-6 flex flex-col gap-4">
              {cms.vision && (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-border-custom w-fit">
                    <Sparkles className="text-primary w-5 h-5" />
                    <h2 className="font-display font-semibold text-text-primary text-xl">
                      Our Vision
                    </h2>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {cms.vision}
                  </p>
                </>
              )}
            </div>

            {cms.trustInformation && (
              <div className="md:col-span-12 flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border-custom w-fit">
                  <Users className="text-primary w-5 h-5" />
                  <h2 className="font-display font-semibold text-text-primary text-xl">
                    Trust Information
                  </h2>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {cms.trustInformation}
                </p>
              </div>
            )}

          </div>
        )}

        {/* 3. GURU BIO AND TEACHINGS */}
        <div className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 flex flex-col items-center text-center gap-4">
            <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-primary/20 bg-secondary relative">
              <img src={guruLineage.imageUrl} alt={guruLineage.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-base leading-snug">{guruLineage.name}</h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-0.5">{guruLineage.title}</p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              {guruLineage.bio}
            </p>
            
            <div className="flex flex-col gap-2 pt-3 border-t border-border-custom">
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1">
                <Sparkles size={12} className="text-primary" />
                Core Chaturmas Teachings
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {guruLineage.teachings.map((t, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5 leading-relaxed">
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* 4. COMMITTEE DIRECTORY */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border-custom w-fit">
            <Users className="text-primary w-5 h-5" />
            <h2 className="font-display font-semibold text-text-primary text-xl">
              Temple Management Committee
            </h2>
          </div>
          
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            The Shree Labriya Jain Trust Committee functions purely as a non-profit volunteer body. Members handle the operational administration of the temple, dharamshala accommodation, bhandara logistics, and chaturmas event management.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {committee.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-custom-md bg-white border border-border-custom shadow-premium flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <h4 className="font-display font-semibold text-text-primary text-sm">{member.name}</h4>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-0.5">{member.role}</p>
                </div>
                <span className="text-[10px] text-primary font-medium mt-3 bg-secondary px-2 py-0.5 rounded-custom-sm w-fit border border-primary/10">
                  {member.term}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. VOWS / PHILOSOPHY */}
        <div className="p-6 rounded-custom-lg bg-emerald-500/5 border border-emerald-500/10 grid grid-cols-1 sm:grid-cols-5 gap-6">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <Award size={18} />
              <span>Panch Mahavrata Values</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed max-w-xs">
              Jainism is centered around five major vows. All operations and trust guidelines of Labriya Mandir respect and uphold these absolute principles.
            </p>
          </div>
          <div className="sm:col-span-3 flex flex-wrap gap-2 items-center justify-start sm:justify-end">
            {["Ahimsa (Non-violence)", "Satya (Truth)", "Achaurya (Non-stealing)", "Brahmacharya (Chastity)", "Aparigraha (Non-possession)"].map((vow, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white text-emerald-800 border border-emerald-500/10 shadow-premium">
                {vow}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
