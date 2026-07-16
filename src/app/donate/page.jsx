"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Copy, 
  Check, 
  Building, 
  FileCheck, 
  Download,
  AlertCircle
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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-16">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 w-fit mx-auto">
          <Heart size={12} fill="currentColor" />
          {t.sevaContribution}
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          {t.supportChaturmas}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t.donateDescription}
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl items-start">
        
        {/* Payment channels */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* UPI and QR Card */}
          <div className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col sm:flex-row gap-8 items-center">
            
            {/* Realistic QR Code Graphic */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-44 h-44 rounded-custom-lg bg-white border border-border-custom overflow-hidden shadow-sm relative group flex items-center justify-center p-1">
                <img 
                  src={cms.donationQr || "/upi_qr_code.png"} 
                  alt="UPI QR Code for Donations" 
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300" 
                />
              </div>
              <span className="text-[10px] text-text-secondary font-bold tracking-widest uppercase flex items-center gap-1">
                {t.scanWithUPI}
              </span>
            </div>

            <div className="flex flex-col justify-center gap-4 w-full">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{t.easyTransfer}</span>
                <h3 className="font-display font-semibold text-text-primary text-lg mt-0.5">{t.upiDonationAddress}</h3>
                <p className="text-xs text-text-secondary mt-1">{t.upiDescription}</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-bg-custom border border-border-custom rounded-custom-md">
                <span className="text-sm font-semibold text-text-primary select-all truncate w-full">
                  {upiId}
                </span>
                <button 
                  onClick={() => copyToClipboard(upiId, "upi")}
                  className="p-2 rounded-custom-sm bg-white border border-border-custom hover:border-primary/50 text-text-secondary hover:text-primary transition-all cursor-pointer shrink-0"
                  title={t.copyUPIID}
                >
                  {copiedUpi ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

          </div>

          {/* Bank Transfer Details */}
          <div className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
              <Building size={20} className="text-primary" />
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">{t.directBankTransfer}</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">{t.neftRtgsImps}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.accountName}</span>
                <span className="font-semibold text-text-primary">{bankDetails.accountName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.bankName}</span>
                <span className="font-semibold text-text-primary">{bankDetails.bankName}</span>
              </div>

              <div className="flex flex-col gap-1 relative group">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.accountNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary select-all">{bankDetails.accountNumber}</span>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "bank")}
                    className="p-1 rounded hover:bg-secondary text-text-secondary hover:text-primary transition-all cursor-pointer"
                  >
                    {copiedBank === "bank" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 relative group">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.ifscCode}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary select-all">{bankDetails.ifscCode}</span>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.ifscCode, "ifsc")}
                    className="p-1 rounded hover:bg-secondary text-text-secondary hover:text-primary transition-all cursor-pointer"
                  >
                    {copiedBank === "ifsc" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.branchDetails}</span>
                <span className="font-medium text-text-primary">{bankDetails.branch}</span>
              </div>
            </div>
          </div>

          {/* Guidelines Exemption Notice */}
          <div className="p-5 rounded-custom-lg bg-orange-50/50 border border-primary/10 flex items-start gap-3">
            <FileCheck size={18} className="text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed flex flex-col gap-1">
              <strong className="text-text-primary font-bold">{t.taxNoticeTitle}</strong>
              <p>{t.taxNoticeText}</p>
            </div>
          </div>

          {/* Trust Credentials Card */}
          <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-4">
            <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-custom pb-2">
              {t.trustCredentials}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{lang === "en" ? "Registration / 80G Info" : "पंजीकरण / 80G जानकारी"}</span>
                <span className="font-semibold text-text-primary">{cms.eightyGInfo || "TRN-38472948-MP"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{lang === "en" ? "Tax Exemption Status" : "टैक्स छूट स्थिति"}</span>
                <span className="font-semibold text-text-primary">{cms.taxDisclaimer || "All contributions are exempt under Section 80G of the Income Tax Act."}</span>
              </div>
              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{lang === "en" ? "Trust Registered Address" : "पंजीकृत पता"}</span>
                <span className="font-semibold text-text-primary">{cms.templeAddress || "Mandir Marg, Labriya, Dhar District, Madhya Pradesh - 454111, India"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Submit verification form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-6">
            <div className="flex flex-col">
              <h3 className="font-display font-semibold text-text-primary text-base">{t.reportTransaction}</h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold mt-0.5">{t.generateReceipt}</p>
            </div>

            <form onSubmit={handleDonationSubmit} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label htmlFor="donor-name" className="text-xs text-text-secondary font-semibold">{t.donorNameLabel}</label>
                <input 
                  id="donor-name"
                  type="text" 
                  placeholder={lang === "en" ? "e.g. Abhi Jain" : "जैसे: अभय कुमार जैन"}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="donor-phone" className="text-xs text-text-secondary font-semibold">{t.phoneNumberLabel}</label>
                <input 
                  id="donor-phone"
                  type="tel" 
                  maxLength={10}
                  placeholder={lang === "en" ? "e.g. 9876543210" : "जैसे: 9876543210"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="donor-amount" className="text-xs text-text-secondary font-semibold">{t.amountDonatedLabel}</label>
                <input 
                  id="donor-amount"
                  type="number" 
                  placeholder={lang === "en" ? "e.g. 5100" : "जैसे: 5100"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="txn-ref" className="text-xs text-text-secondary font-semibold">{t.upiReferenceLabel}</label>
                <input 
                  id="txn-ref"
                  type="text" 
                  placeholder={lang === "en" ? "e.g. U240711..." : "जैसे: U240711..."}
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-custom-md bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-premium-hover transition-all mt-2 cursor-pointer flex items-center justify-center"
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
                  className="p-5 rounded-custom-lg bg-emerald-50 border border-emerald-500/10 flex flex-col gap-4 mt-2"
                >
                  <div className="flex items-start gap-2.5 text-emerald-800">
                    <FileCheck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">
                        {lang === "en" ? "Transaction Registered" : "लेनदेन सफलतापूर्वक दर्ज"}
                      </p>
                      <p className="text-[10px] text-emerald-600/80 mt-0.5">
                        {lang === "en" 
                          ? `Thank you! Your donation of INR ${completedDonation.amount.toLocaleString("en-IN")} has been filed under transaction ID: ${completedDonation.txnId}.`
                          : `धन्यवाद! आपकी INR ${completedDonation.amount.toLocaleString("en-IN")} की दान राशि संदर्भ आईडी: ${completedDonation.txnId} के तहत दर्ज कर ली गई है।`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => triggerPrintReceipt(completedDonation)}
                      className="flex-1 py-2 px-3 rounded-custom-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>{lang === "en" ? "Download Receipt" : "रसीद डाउनलोड करें"}</span>
                    </button>
                    <button 
                      onClick={() => setCompletedDonation(null)}
                      className="py-2 px-3 rounded-custom-md bg-white border border-border-custom hover:border-emerald-500/30 text-text-secondary hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {lang === "en" ? "Close" : "बंद करें"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}
