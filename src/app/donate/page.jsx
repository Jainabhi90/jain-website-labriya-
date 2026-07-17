"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Copy, 
  Check, 
  Building, 
  FileCheck, 
  Download,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Gift,
  Clock
} from "lucide-react";
import { db } from "@/services/db";
import { translations } from "@/services/translations";
import confetti from "canvas-confetti";
import { useCMS } from "@/context/CMSContext";

export default function Donate() {
  const [lang, setLang] = useState("en");
  const { cms } = useCMS();

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

  const t = translations[lang] || translations["en"];

  const upiId = cms.upiId || "shreelabriyatrust@okaxis";
  const bankDetails = {
    bankName: cms.bankName || "State Bank of India",
    accountName: cms.accountHolder || "Shree Labriya Jain Mandir Trust",
    accountNumber: cms.accountNumber || "38472948194",
    ifscCode: cms.ifsc || "SBIN0030129",
    branch: cms.branch || "Dhar Branch, Madhya Pradesh",
  };

  // Form states
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedDonation, setCompletedDonation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(type);
      setTimeout(() => setCopiedBank(null), 2000);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!donorName.trim() || !phone.trim() || !amount.trim() || !txnId.trim()) {
      setErrorMsg(lang === "en" ? "Please fill in all fields to register the donation." : "कृपया दान दर्ज करने के लिए सभी क्षेत्रों को भरें।");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg(lang === "en" ? "Please enter a valid donation amount." : "कृपया एक मान्य दान राशि दर्ज करें।");
      return;
    }
    if (txnId.trim().length < 8) {
      setErrorMsg(lang === "en" ? "Transaction Reference ID must be at least 8 characters." : "ट्रांजैक्शन संदर्भ आईडी कम से कम ८ वर्णों की होनी चाहिए।");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const record = await db.createDonation({
        donorName: donorName.trim(),
        phone: phone.trim(),
        amount: parsedAmount,
        txnId: txnId.trim()
      });
      
      setCompletedDonation(record);
      
      // Trigger canvas confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear Form
      setDonorName("");
      setPhone("");
      setAmount("");
      setTxnId("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || (lang === "en" ? "An error occurred. Please check details and try again." : "त्रुटि हुई। कृपया विवरण जांचें और पुनः प्रयास करें।"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ Contents
  const faqs = [
    {
      q: lang === "en" ? "How do I receive my 80G tax receipt?" : "मुझे 80G टैक्स रसीद कैसे प्राप्त होगी?",
      a: lang === "en"
        ? "Once you register your transaction reference ID on this portal, our trust office verifies it with bank logs. A signed computer receipt is sent to you on WhatsApp/SMS within 2-3 working days. You can also print the temporary receipt voucher instantly."
        : "एक बार जब आप इस पोर्टल पर अपनी संदर्भ आईडी पंजीकृत करते हैं, तो हमारा ट्रस्ट कार्यालय बैंक रिकॉर्ड के साथ इसका मिलान करता है। २-३ कार्य दिवसों के भीतर हस्ताक्षरित रसीद आपके व्हाट्सएप/एसएमएस पर भेज दी जाएगी।"
    },
    {
      q: lang === "en" ? "Can I donate internationally?" : "क्या मैं अंतरराष्ट्रीय स्तर पर दान कर सकता हूँ?",
      a: lang === "en"
        ? "Currently, we only accept domestic Indian Rupee transfers via UPI and Indian Bank accounts. For international remittances, please contact our trust office directly via email to process bank wire approvals."
        : "वर्तमान में हम केवल यूपीआई और भारतीय बैंक खातों के माध्यम से घरेलू भारतीय रुपया हस्तांतरण स्वीकार करते हैं। विदेशी मुद्रा हस्तांतरण हेतु कृपया हमारे ट्रस्ट कार्यालय से ईमेल द्वारा संपर्क करें।"
    },
    {
      q: lang === "en" ? "How are these donations utilized?" : "इन दान राशियों का उपयोग कहाँ किया जाता है?",
      a: lang === "en"
        ? "Donations are utilized directly for Sadhu-Sadhvi seva, holy Chaturmas food arrangements, daily temple worship items, dharamshala maintenance, and community welfare programs around Labriya village."
        : "दान राशि का उपयोग सीधे साधु-साध्वी सेवा, पावन चातुर्मास भोजन व्यवस्था, दैनिक मंदिर पूजा सामग्री, धर्मशाला रखरखाव और लाबरिया गांव के सामाजिक कल्याण कार्यक्रमों के लिए किया जाता है।"
    },
    {
      q: lang === "en" ? "Can I sponsor a specific Chaturmas event?" : "क्या मैं किसी विशेष चातुर्मास कार्यक्रम को प्रायोजित कर सकता हूँ?",
      a: lang === "en"
        ? "Yes! Seva options like sponsoring a daily pravachan, daily aarti, or specific festival meals are available. Please connect with our support line on WhatsApp for availability and bookings."
        : "हां! आप दैनिक प्रवचन, दैनिक आरती, अथवा विशेष त्योहार के भोजन का प्रायोजन कर सकते हैं। प्रायोजन उपलब्धता और बुकिंग के लिए कृपया हमारे व्हाट्सएप सहायता नंबर पर संपर्क करें।"
    }
  ];

  // Printable receipt generator
  const triggerPrintReceipt = (donation) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - Shree Labriya Mandir Trust</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #1F2937;
              padding: 40px;
              line-height: 1.6;
            }
            .receipt-box {
              max-width: 700px;
              margin: 0 auto;
              border: 1px solid #ECECEC;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.02);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #EA580C;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
              color: #C28A3E;
            }
            .header p {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin: 5px 0 0 0;
              color: #6B7280;
            }
            .title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              text-decoration: underline;
              margin-bottom: 30px;
              color: #1F2937;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
            }
            .detail-item {
              font-size: 14px;
            }
            .detail-item strong {
              display: block;
              color: #6B7280;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 3px;
            }
            .amount-word {
              font-size: 15px;
              font-weight: 600;
              background-color: #FFF7ED;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #FFE3C3;
              margin-bottom: 40px;
            }
            .footer-notes {
              font-size: 11px;
              color: #6B7280;
              border-top: 1px solid #ECECEC;
              padding-top: 20px;
              text-align: center;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              margin-bottom: 30px;
            }
            .sig-line {
              width: 180px;
              border-top: 1px solid #6B7280;
              text-align: center;
              font-size: 12px;
              padding-top: 5px;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .receipt-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="max-width: 700px; margin: 0 auto 20px auto; text-align: right;">
            <button onclick="window.print()" style="background:#EA580C; color:white; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">Print Receipt</button>
          </div>
          <div class="receipt-box">
            <div class="header">
              <h1>SHREE LABRIYA JAIN SHWETAMBAR MANDIR TRUST</h1>
              <p>Mandir Marg, Labriya, Dhar, Madhya Pradesh - 454111</p>
            </div>
            
            <div class="title">DONATION RECEIPT VOUCHER</div>
            
            <div class="details-grid">
              <div class="detail-item">
                <strong>Receipt Number</strong>
                #LAB-REC-${donation.id.toUpperCase()}
              </div>
              <div class="detail-item">
                <strong>Date & Time</strong>
                ${new Date(donation.createdAt).toLocaleString()}
              </div>
              <div class="detail-item">
                <strong>Donor Name</strong>
                ${donation.donorName}
              </div>
              <div class="detail-item">
                <strong>Contact Number</strong>
                +91 ${donation.phone}
              </div>
              <div class="detail-item">
                <strong>Transaction ID</strong>
                ${donation.txnId}
              </div>
              <div class="detail-item">
                <strong>Donation Status</strong>
                Pending Verification
              </div>
            </div>

            <div class="amount-word">
              <strong style="display:block; font-size:11px; text-transform:uppercase; color:#EA580C; margin-bottom:5px;">Amount Donated</strong>
              INR ${donation.amount.toLocaleString("en-IN")}.00
            </div>

            <div class="signatures">
              <div class="sig-line">Donor Signature</div>
              <div class="sig-line" style="color: #EA580C; font-weight: bold;">
                <span style="font-family: 'Brush Script MT', cursive; font-size: 20px; display: block; height: 24px; margin-top: -15px;">Trust Office</span>
                Authorized Signatory
              </div>
            </div>

            <div class="footer-notes">
              Thank you for your generous contribution towards the Chaturmas 2026 arrangements. <br />
              This is a computer-generated voucher and does not require a physical stamp. <br />
              All contributions are exempt under Section 80G of the Income Tax Act.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pt-20 pb-16 flex flex-col items-center">
      
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center flex flex-col items-center gap-4">
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#C28A3E]/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C28A3E] flex items-center gap-1.5 select-none">
          <Heart size={12} fill="currentColor" className="text-[#EA580C]" />
          {t.sevaContribution || "Seva Contribution"}
        </span>
        
        <h1 className="font-display font-bold text-text-primary text-3xl sm:text-4xl md:text-5xl mt-2 leading-tight">
          {t.supportChaturmas}
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
          {t.donateDescription || "Support the spiritual, cultural, and community arrangements of the Shree Labriya Chaturmas Festival 2026. Your generous Seva enables us to serve sadhus, pilgrims, and local welfare."}
        </p>

        {/* Small Jain icon or graphic */}
        <div className="text-2xl mt-1 select-none">🪷</div>
      </section>

      {/* 2. TWO COLUMN GRID LAYOUT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Payment details, Trust cards, FAQs (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Trust Section Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-custom-md bg-white border border-[#EA580C]/5 shadow-premium text-left">
              <span className="text-xl">🕌</span>
              <h4 className="font-semibold text-xs sm:text-sm text-text-primary mt-2">{lang === "en" ? "Temple Care" : "मंदिर व्यवस्था"}</h4>
              <p className="text-[10px] text-text-secondary mt-1">{lang === "en" ? "Daily puja rituals, maintenance & lighting." : "दैनिक महापूजा, सामग्री एवं जीर्णोद्धार व्यवस्था।"}</p>
            </div>
            
            <div className="p-4 rounded-custom-md bg-white border border-[#EA580C]/5 shadow-premium text-left">
              <span className="text-xl">🍲</span>
              <h4 className="font-semibold text-xs sm:text-sm text-text-primary mt-2">{lang === "en" ? "Sadharmik Vatsalya" : "साधर्मिक वात्सल्य"}</h4>
              <p className="text-[10px] text-text-secondary mt-1">{lang === "en" ? "Meals for pilgrims and Chaturmas circles." : "यात्रियों एवं श्रद्धालुओं के लिए भोजनशाला व्यवस्था।"}</p>
            </div>

            <div className="p-4 rounded-custom-md bg-white border border-[#EA580C]/5 shadow-premium text-left col-span-2 sm:col-span-1">
              <span className="text-xl">🙏</span>
              <h4 className="font-semibold text-xs sm:text-sm text-text-primary mt-2">{lang === "en" ? "Sadhu Seva" : "साधु-साध्वी सेवा"}</h4>
              <p className="text-[10px] text-text-secondary mt-1">{lang === "en" ? "Support for lodging, medical & vihar." : "मुनिराजों एवं साध्वीजी भगवंतों की वैयावच्च।"}</p>
            </div>
          </div>

          {/* UPI and QR Card */}
          <div className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col sm:flex-row gap-6 items-center">
            
            {/* QR Code Frame */}
            <div className="flex flex-col items-center gap-2 shrink-0 select-none">
              <div className="w-40 h-40 rounded-custom-lg bg-white border border-[#C28A3E]/20 overflow-hidden shadow-sm relative group flex items-center justify-center p-1.5">
                <img 
                  src={cms.donationQr || "/upi_qr_code.png"} 
                  alt="UPI QR Code" 
                  loading="lazy"
                  className="w-full h-full object-contain" 
                />
              </div>
              <span className="text-[9px] text-[#C28A3E] font-bold tracking-widest uppercase">
                {t.scanWithUPI}
              </span>
            </div>

            <div className="flex flex-col justify-center gap-3.5 w-full text-left">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#EA580C]">{t.easyTransfer}</span>
                <h3 className="font-display font-semibold text-text-primary text-base mt-0.5">{t.upiDonationAddress}</h3>
                <p className="text-[11px] text-text-secondary mt-1">{t.upiDescription}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#FCFBF7] border border-[#C28A3E]/10 rounded-custom-md">
                <span className="text-xs sm:text-sm font-semibold text-text-primary select-all truncate max-w-[200px] sm:max-w-none">
                  {upiId}
                </span>
                <button 
                  onClick={() => copyToClipboard(upiId, "upi")}
                  className="p-2 rounded-custom-sm bg-white border border-[#C28A3E]/10 hover:border-[#EA580C]/40 text-[#4B5563] hover:text-[#EA580C] transition-all cursor-pointer shrink-0 shadow-sm"
                  title={t.copyUPIID}
                >
                  {copiedUpi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

          </div>

          {/* Bank Transfer Details */}
          <div className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-5 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-[#EA580C]/5">
              <Building size={18} className="text-[#EA580C]" />
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">{t.directBankTransfer}</h3>
                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold mt-0.5">{t.neftRtgsImps}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{t.accountName}</span>
                <span className="font-semibold text-text-primary">{bankDetails.accountName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{t.bankName}</span>
                <span className="font-semibold text-text-primary">{bankDetails.bankName}</span>
              </div>

              <div className="flex flex-col gap-0.5 relative group">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{t.accountNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary select-all">{bankDetails.accountNumber}</span>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "bank")}
                    className="p-1 rounded hover:bg-[#FFF7ED] text-[#4B5563] hover:text-[#EA580C] transition-all cursor-pointer shadow-sm border border-[#C28A3E]/5 bg-white"
                  >
                    {copiedBank === "bank" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 relative group">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{t.ifscCode}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary select-all">{bankDetails.ifscCode}</span>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.ifscCode, "ifsc")}
                    className="p-1 rounded hover:bg-[#FFF7ED] text-[#4B5563] hover:text-[#EA580C] transition-all cursor-pointer shadow-sm border border-[#C28A3E]/5 bg-white"
                  >
                    {copiedBank === "ifsc" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-0.5">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{t.branchDetails}</span>
                <span className="font-medium text-text-primary">{bankDetails.branch}</span>
              </div>
            </div>
          </div>

          {/* Donation Message / Jain Charity philosophy */}
          <div className="p-6 rounded-custom-lg bg-[#FCFBF7] border border-[#C28A3E]/20 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left relative overflow-hidden">
            <span className="text-[9.5px] uppercase font-bold text-[#C28A3E] tracking-wider block mb-1">
              {lang === "en" ? "Jain Charity Philosophy" : "जैन दान महिमा"}
            </span>
            <p className="text-xs text-[#4B5563] leading-relaxed italic">
              {lang === "en"
                ? "Selfless giving (Daana) is one of the pillars of Jain dharma, representing the purification of wealth, removal of attachments, and cultivation of compassion (karuna) for the spiritual upliftment of all souls."
                : "स्वार्थरहित दान (सुपात्र दान) जैन धर्म के मूल स्तंभों में से एक है, जो धन की शुद्धि, आसक्ति का त्याग और समस्त जीवों के प्रति अनुकंपा का प्रतीक है।"}
            </p>
          </div>

          {/* FAQs Accordion */}
          <div className="flex flex-col gap-3 text-left">
            <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-[#C28A3E]" />
              <span>{lang === "en" ? "Frequently Asked Questions" : "पूछे जाने वाले सामान्य प्रश्न"}</span>
            </h3>

            <div className="flex flex-col gap-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white border border-[#EA580C]/5 rounded-custom-md shadow-sm overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-text-primary hover:bg-[#FCFBF7] transition-colors cursor-pointer select-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={14} className={`text-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4.5 pt-1 text-xs text-[#4B5563] leading-relaxed border-t border-[#EA580C]/5 bg-[#FCFBF7]/35"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Report verification form & tax status (col-span-5) */}
        <div className="lg:col-span-5 w-full flex flex-col gap-6 sticky top-24">
          
          {/* Submit transaction registration form */}
          <div className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-5 text-left">
            <div className="flex flex-col border-b border-[#EA580C]/5 pb-3">
              <h3 className="font-display font-semibold text-text-primary text-base leading-none">{t.reportTransaction}</h3>
              <p className="text-[9px] text-[#C28A3E] uppercase tracking-widest font-bold mt-1.5 leading-none">{t.generateReceipt}</p>
            </div>

            <form onSubmit={handleDonationSubmit} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="donor-name" className="text-[11px] text-text-secondary font-semibold">{t.donorNameLabel}</label>
                <input 
                  id="donor-name"
                  type="text" 
                  placeholder={lang === "en" ? "e.g. Abhi Jain" : "जैसे: अभय कुमार जैन"}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="donor-phone" className="text-[11px] text-text-secondary font-semibold">{t.phoneNumberLabel}</label>
                <input 
                  id="donor-phone"
                  type="tel" 
                  maxLength={10}
                  placeholder={lang === "en" ? "e.g. 9876543210" : "जैसे: 9876543210"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="donor-amount" className="text-[11px] text-text-secondary font-semibold">{t.amountDonatedLabel}</label>
                <input 
                  id="donor-amount"
                  type="number" 
                  placeholder={lang === "en" ? "e.g. 5100" : "जैसे: 5100"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="txn-ref" className="text-[11px] text-text-secondary font-semibold">{t.upiReferenceLabel}</label>
                <input 
                  id="txn-ref"
                  type="text" 
                  placeholder={lang === "en" ? "e.g. U240711..." : "जैसे: U240711..."}
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-custom-md bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all mt-2 cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? t.submitting : t.submitTransaction}
              </motion.button>
            </form>

            <AnimatePresence>
              {completedDonation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-custom-md bg-emerald-50 border border-emerald-500/10 flex flex-col gap-3.5 mt-2"
                >
                  <div className="flex items-start gap-2.5 text-emerald-800">
                    <FileCheck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">
                        {lang === "en" ? "Transaction Registered" : "लेनदेन दर्ज कर लिया गया है"}
                      </p>
                      <p className="text-[10px] text-emerald-600/85 mt-0.5 leading-relaxed">
                        {lang === "en" 
                          ? `Thank you! Your donation of INR ${completedDonation.amount.toLocaleString("en-IN")} has been filed under ID: ${completedDonation.txnId}.`
                          : `धन्यवाद! आपकी INR ${completedDonation.amount.toLocaleString("en-IN")} की दान राशि संदर्भ आईडी: ${completedDonation.txnId} के तहत दर्ज कर ली गई है।`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 select-none">
                    <button 
                      onClick={() => triggerPrintReceipt(completedDonation)}
                      className="flex-1 py-2 px-3 rounded-custom-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>{lang === "en" ? "Print Receipt" : "रसीद प्रिंट करें"}</span>
                    </button>
                    <button 
                      onClick={() => setCompletedDonation(null)}
                      className="py-2 px-3 rounded-custom-md bg-white border border-border-custom hover:border-emerald-500/30 text-text-secondary hover:text-emerald-700 font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {lang === "en" ? "Close" : "बंद करें"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* 80G Tax Exemption & Disclaimer card */}
          <div className="p-5 rounded-custom-lg bg-[#FFF7ED]/35 border border-[#EA580C]/10 flex items-start gap-3 text-left">
            <ShieldCheck size={18} className="text-[#EA580C] shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed flex flex-col gap-1">
              <strong className="text-text-primary font-bold">{lang === "en" ? "80G Tax Exempt Benefits" : "80G टैक्स छूट पात्रता"}</strong>
              <p className="text-[10px] sm:text-[11px] text-[#4B5563]">
                {cms.taxDisclaimer || (lang === "en" ? "All contributions made to Shree Labriya Mandir Trust are eligible for tax deduction under Section 80G of the Income Tax Act." : "श्री लाबरिया मंदिर ट्रस्ट में किया गया सभी दान आयकर अधिनियम की धारा 80G के तहत टैक्स कटौती के लिए पात्र है।")}
              </p>
            </div>
          </div>

          {/* Contact Help Support card */}
          <div className="p-5 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium text-left flex flex-col gap-3">
            <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-neutral-100 pb-2">
              {lang === "en" ? "Trust Office Assistance" : "ट्रस्ट कार्यालय सहायता"}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-[#4B5563] font-medium">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#C28A3E]" />
                <span>{cms.contactNumber || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#C28A3E]" />
                <span>{cms.email || "support@labriyachaturmas.in"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[#C28A3E]" />
                <span>{cms.officeTiming || "09:00 AM - 06:00 PM"}</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
