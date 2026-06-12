import React, { useState } from "react";
import { CreditCard, FileText, Upload, CheckCircle2, AlertTriangle, Landmark, Users, Plus, Trash2 } from "lucide-react";
import { DematAccount } from "../types";

interface DematModuleProps {
  demat: DematAccount;
  onUpdateDemat: (demat: DematAccount) => void;
}

export default function DematModule({ demat, onUpdateDemat }: DematModuleProps) {
  const [activeStep, setActiveStep] = useState<"pan_aadhaar" | "bank" | "nominees" | "status">(
    demat.status === "NOT_STARTED" ? "pan_aadhaar" : "status"
  );

  // Form states
  const [pan, setPan] = useState(demat.pan || "");
  const [aadhaar, setAadhaar] = useState(demat.aadhaar || "");
  const [bankName, setBankName] = useState(demat.bankName || "");
  const [bankAccount, setBankAccount] = useState(demat.bankAccount || "");
  const [ifsc, setIfsc] = useState(demat.ifsc || "");

  // Nominee state
  const [nomineeName, setNomineeName] = useState(demat.nomineeName || "");
  const [nomineeRelation, setNomineeRelation] = useState(demat.nomineeRelation || "");
  const [nomineeAllocation, setNomineeAllocation] = useState(demat.nomineeAllocation || 100);

  const [loading, setLoading] = useState(false);
  const [errorOnSubmit, setErrorOnSubmit] = useState("");

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOnSubmit("");

    // Validate standard corporate PAN regex pattern helper
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setErrorOnSubmit("Compliance alert: PAN number must match structural format: 5 letters, 4 digits, 1 letter. (e.g. ABCDE1234F)");
      return;
    }

    if (aadhaar.length < 12) {
      setErrorOnSubmit("Compliance alert: Aadhaar standard format must be 12 digits.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onUpdateDemat({
        ...demat,
        pan: pan.toUpperCase(),
        aadhaar,
        kycStatus: "PENDING",
      });
      setLoading(false);
      setActiveStep("bank");
    }, 1200);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bankAccount.length < 9) {
      setErrorOnSubmit("Accounting alert: Account Number must be at least 9 characters.");
      return;
    }
    if (ifsc.length < 6) {
      setErrorOnSubmit("Accounting alert: IFSC code invalid.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onUpdateDemat({
        ...demat,
        bankName,
        bankAccount,
        ifsc: ifsc.toUpperCase(),
      });
      setLoading(false);
      setActiveStep("nominees");
    }, 1000);
  };

  const handleNomineeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName) {
      setErrorOnSubmit("Verification alert: Nominee full legal name required.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onUpdateDemat({
        ...demat,
        nomineeName,
        nomineeRelation,
        nomineeAllocation,
        status: "VERIFIED",
        kycStatus: "VERIFIED",
        accountNumber: "IN-DEMAT-" + Math.floor(100000 + Math.random() * 900000),
        dpId: "DP-2526-QP",
      });
      setLoading(false);
      setActiveStep("status");
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Module Title */}
      <div className="p-6 md:p-8 border-b border-slate-800/80 bg-slate-900/40 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-xl md:text-2xl font-display tracking-tight text-white font-bold flex items-center space-x-2.5">
          <CreditCard className="w-5.5 h-5.5 text-indigo-400" />
          <span>Fiduciary Demat & KYC Account Registry</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-sans max-w-2xl">
          Configure verified custody depository accounts conforming to international financial standards and SEBI compliance regulations.
        </p>
      </div>

      {/* Progress tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-mono">
        <button
          onClick={() => decrStep("pan_aadhaar")}
          disabled={demat.status === "VERIFIED"}
          className={`px-4 py-3 border-r border-slate-800 flex items-center space-x-1.5 transition ${
            activeStep === "pan_aadhaar" ? "bg-slate-900 text-indigo-400" : "text-slate-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. KYC Documents</span>
        </button>
        <button
          onClick={() => decrStep("bank")}
          disabled={demat.status === "VERIFIED" || !demat.pan}
          className={`px-4 py-3 border-r border-slate-800 flex items-center space-x-1.5 transition ${
            activeStep === "bank" ? "bg-slate-900 text-indigo-400" : "text-slate-400"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>2. Bank Linking</span>
        </button>
        <button
          onClick={() => decrStep("nominees")}
          disabled={demat.status === "VERIFIED" || !demat.bankAccount}
          className={`px-4 py-3 border-r border-slate-800 flex items-center space-x-1.5 transition ${
            activeStep === "nominees" ? "bg-slate-900 text-indigo-400" : "text-slate-400"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Nominees Allocation</span>
        </button>
        <button
          onClick={() => setActiveStep("status")}
          disabled={demat.status === "NOT_STARTED"}
          className={`px-4 py-3 flex items-center space-x-1.5 transition ${
            activeStep === "status" ? "bg-slate-900 text-indigo-400" : "text-slate-400"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Registry Status</span>
        </button>
      </div>

      <div className="p-6">
        {errorOnSubmit && (
          <div className="mb-4 p-3.5 bg-red-950/35 border border-red-500/20 rounded-lg text-red-200 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorOnSubmit}</span>
          </div>
        )}

        {/* STEP 1: PAN & AADHAAR */}
        {activeStep === "pan_aadhaar" && (
          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <h3 className="text-sm font-sans font-medium text-slate-200 uppercase tracking-wider mb-2">
              Identity Verification Logs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">PAN Identification Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Aadhaar UID Resident Identification</label>
                <input
                  type="text"
                  required
                  placeholder="12 digit number"
                  maxLength={12}
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 font-mono transition"
                />
              </div>
            </div>

            {/* Document upload simulation block */}
            <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center bg-slate-950/40">
              <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Upload verification credentials (PDF, JPG)</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Encrypted via multi-tenant military AES-256 blocks</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
            >
              {loading ? "Validating Regulatory PAN..." : "Verify Identity & Continue"}
            </button>
          </form>
        )}

        {/* STEP 2: BANK LINKING */}
        {activeStep === "bank" && (
          <form onSubmit={handleBankSubmit} className="space-y-4 font-sans">
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider mb-2">
              National Settlement Clearing Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Corporate Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JPMorgan Chase, SEB Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Direct Settlement Account No</label>
                <input
                  type="text"
                  required
                  placeholder="Routing bank ledger"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Depository IFSC Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBIN00234"
                  maxLength={11}
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 font-mono transition"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
              >
                {loading ? "Registering bank mandate..." : "Verify & Anchor Bank Ledger"}
              </button>
              <button
                type="button"
                onClick={() => setActiveStep("pan_aadhaar")}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded text-xs transition"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NOMINEE ALLOCATION */}
        {activeStep === "nominees" && (
          <form onSubmit={handleNomineeSubmit} className="space-y-4">
            <h3 className="text-sm font-sans font-medium text-slate-200 uppercase tracking-wider mb-2">
              Succession Custody Allocation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Nominee Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full legal name"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-700 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Legal Relationship</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child (Natural / Adopted)</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Trust">Trust Designated Representative</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5">Percentage Allocation (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={nomineeAllocation}
                  onChange={(e) => setNomineeAllocation(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
              >
                {loading ? "Activating account records..." : "Finalize & File Demat Account"}
              </button>
              <button
                type="button"
                onClick={() => setActiveStep("bank")}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded text-xs transition"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: VERIFICATION STATUS */}
        {activeStep === "status" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base text-white font-semibold">Depository Portfolio Approved</h4>
                <p className="text-slate-400 text-xs mt-0.5">Your official corporate Demat account is anchored, compliance-verified and active.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-800 bg-slate-950/30 rounded-xl p-4 font-mono text-xs text-slate-300">
              <div className="space-y-2">
                <p><span className="text-slate-500 uppercase">Demat Depository ID:</span> {demat.dpId || "DP-2526-QP"}</p>
                <p><span className="text-slate-500 uppercase">Account Number:</span> {demat.accountNumber || "IN-DEMAT-97210"}</p>
                <p><span className="text-slate-500 uppercase">Compliance Pan Index:</span> {demat.pan || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <p><span className="text-slate-500 uppercase">Settlement Bank Name:</span> {demat.bankName || "N/A"}</p>
                <p><span className="text-slate-500 uppercase">Clearing Ledger Code:</span> {demat.ifsc || "N/A"}</p>
                <p><span className="text-slate-500 uppercase">Primary Nominee:</span> {demat.nomineeName || "N/A"} ({demat.nomineeRelation}, {demat.nomineeAllocation}%)</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm("Reset current regulatory profile for simulation?")) {
                    onUpdateDemat({
                      accountNumber: "",
                      dpId: "",
                      status: "NOT_STARTED",
                      kycStatus: "NOT_STARTED",
                      pan: "",
                      aadhaar: "",
                      bankName: "",
                      bankAccount: "",
                      ifsc: "",
                      nomineeName: "",
                      nomineeRelation: "Spouse",
                      nomineeAllocation: 100,
                    });
                    setActiveStep("pan_aadhaar");
                  }
                }}
                className="px-3 py-1.5 border border-slate-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/20 text-slate-500 rounded text-xs transition"
              >
                Reset Demat Registry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function decrStep(step: "pan_aadhaar" | "bank" | "nominees") {
    if (demat.status !== "VERIFIED") {
      setActiveStep(step);
    }
  }
}
