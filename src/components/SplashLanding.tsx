import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Lock, 
  User, 
  KeyRound, 
  Check, 
  RefreshCw, 
  BarChart2, 
  Phone, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Mail, 
  Smartphone, 
  FileText, 
  LockKeyhole,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserSession } from "../types";

interface SplashLandingProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function SplashLanding({ onLoginSuccess }: SplashLandingProps) {
  // Navigation states
  // "LOGIN" | "REGISTER" | "OTP_VERIFY" | "MFA_CHALLENGE" | "FORGOT" | "RESET"
  const [mode, setMode] = useState<"LOGIN" | "REGISTER" | "OTP_VERIFY" | "MFA_CHALLENGE" | "FORGOT" | "RESET">("LOGIN");

  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("quantadvisor@goldman-sachs.com");
  const [mobile, setMobile] = useState("+919876543210");
  const [password, setPassword] = useState("SecurePass123!");
  const [confirmPassword, setConfirmPassword] = useState("SecurePass123!");
  
  // Security controls
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaSliding, setCaptchaSliding] = useState(false);
  const [captchaProgress, setCaptchaProgress] = useState(0);

  // Verification & reset code holders
  const [verificationOtp, setVerificationOtp] = useState<string[]>(Array(6).fill(""));
  const [mfaCode, setMfaCode] = useState<string[]>(Array(6).fill(""));
  const [recoveryCodeString, setRecoveryCodeString] = useState("");
  const [backupCodesReceived, setBackupCodesReceived] = useState<string[]>([]);
  const [resetToken, setResetToken] = useState("");

  // Live simulation system-message outbox (essential to copy-paste simulation keys!)
  const [simulatedInbox, setSimulatedInbox] = useState<{ title: string; message: string; code?: string } | null>({
    title: "System Seeding Status",
    message: "QuantMind AI Gateways initialized. Use default corporate credentials to inspect premium dashboard immediately or register a new secure vault account."
  });

  // UI operationals
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attemptsInfo, setAttemptsInfo] = useState("");

  // Timer controls for OTP expiration
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((mode === "OTP_VERIFY" || mode === "MFA_CHALLENGE") && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Turnstile slider CAPTCHA simulation
  const handleCaptchaProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (captchaVerified || !captchaSliding) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    
    if (progress >= 95) {
      setCaptchaProgress(100);
      setCaptchaVerified(true);
      setCaptchaSliding(false);
      // Trigger a light security event trace
      setSimulatedInbox({
        title: "Cloudflare Turnstile Verified",
        message: "Bot protection cleared successfully. Client device signature verified as humane.",
      });
    } else {
      setCaptchaProgress(progress);
    }
  };

  // Password Policy meter checking
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return {
      score,
      label: score <= 2 ? "WEAK" : score <= 4 ? "MODERATE" : "STRONG",
      color: score <= 2 ? "bg-red-500" : score <= 4 ? "bg-amber-500" : "bg-emerald-500"
    };
  };

  const strengthInfo = checkPasswordStrength(password);

  // Authentication: Registration Call
  const triggerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError("Please complete the Turnstile bot verification check first.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password mismatch. Confirm password must equal secret password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          captchaToken: "simulated_success",
          device: {
            deviceId: "web_client_" + Math.random().toString(36).substr(2, 6),
            browser: "Chrome v124",
            os: "macOS Sonoma",
            ip: "202.45.18.99",
            location: "Mumbai, Maharashtra"
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setMode("OTP_VERIFY");
        setTimerSeconds(300);
        // Intercept and publish dispatch data onto simulated SMS drawer
        setSimulatedInbox({
          title: "🔐 Verification SMS Broadcast",
          message: `Dear ${name}, security regulations demand phone OTP clearance. Use the generated security token below to configure your wealth keys. Code expires in 5 minutes.`,
          code: data.demoOtp
        });
        setCaptchaVerified(false);
        setCaptchaProgress(0);
      } else {
        setError(data.error || "Dynamic registration failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Clearinghouse servers are currently busy. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Register OTP Verification
  const verifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = verificationOtp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit passcode.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpCode,
          device: {
            deviceId: "web_client_mac",
            browser: "Chrome",
            os: "macOS",
            ip: "202.45.18.99",
            location: "Mumbai, Maharashtra"
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem("quantmind_token", data.token);
        
        // Setup recovery codes sheet
        setBackupCodesReceived(data.recoveryCodes || []);
        setSuccess("Account activated and secure ledger configured!");
        
        // Set dynamic welcome outbox
        setSimulatedInbox({
          title: "🔑 Secure Backup Sheet Created",
          message: "Keep these backup recovery keys in a safe, non-digital vault index. In case of lost security credentials, entering these codes grants absolute control over your financial records."
        });
        
        setTimeout(() => {
          onLoginSuccess({
            id: data.user.id,
            firstName: data.user.name.split(" ")[0] || "Jane",
            lastName: data.user.name.split(" ").slice(1).join(" ") || "Doe",
            email: data.user.email,
            mobile: data.user.mobile,
            role: data.user.role,
            isLoggedIn: true,
            token: data.token,
            mfaEnabled: data.user.mfaEnabled,
            mfaType: data.user.mfaType
          });
        }, 3000);
      } else {
        setError(data.error || "Verification OTP is incorrect.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendVerificationCode = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setTimerSeconds(300);
        setSuccess("Dynamic authorization key rotated and dispatched.");
        setSimulatedInbox({
          title: "🔄 Rotated Credentials Dispatched",
          message: "New secondary-factor passcode compiled into index. Enter this immediately to unlock.",
          code: data.demoOtp
        });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to rotate validation key.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Secure Login
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError("Please complete the Turnstile bot verification check first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: email, // works with email or mobile
          password,
          captchaToken: "simulated_success",
          device: {
            deviceId: "chrome_desktop_mac",
            browser: "Chrome 124",
            os: "macOS 14",
            ip: "103.45.1.92",
            location: "Mumbai, India"
          }
        })
      });

      const data = await response.json();

      if (response.status === 202 && data.verificationRequired) {
        // Redir to complete verify-otp
        setEmail(data.email);
        setMode("OTP_VERIFY");
        setTimerSeconds(300);
        setSuccess("Please complete initial verification flow.");
        setSimulatedInbox({
          title: "🔐 Verification OTP Pending",
          message: "Your profile is registered but pending email clearance. Retrieve the safety code below to activate access.",
          code: data.demoOtp
        });
      } else if (response.ok && data.mfaRequired) {
        setMode("MFA_CHALLENGE");
        setTimerSeconds(300);
        setSuccess("Password match validated. Multi-factor challenge issued.");
        setSimulatedInbox({
          title: "⚙️ Second-Factor Challenge Issued",
          message: "A 6-digit cryptographic challenge has been posted. For simulation tests, copy the live key below or enter your downloaded backup code key.",
          code: data.demoOtp
        });
      } else if (response.ok) {
        localStorage.setItem("quantmind_token", data.token);
        setSuccess("Fiduciary keys validated. Accessing core platform...");
        
        setTimeout(() => {
          onLoginSuccess({
            id: data.user.id,
            firstName: data.user.name.split(" ")[0] || "Jane",
            lastName: data.user.name.split(" ").slice(1).join(" ") || "Doe",
            email: data.user.email,
            mobile: data.user.mobile,
            role: data.user.role,
            isLoggedIn: true,
            token: data.token,
            mfaEnabled: data.user.mfaEnabled,
            mfaType: data.user.mfaType
          });
        }, 1200);
      } else {
        setError(data.error || "Login denied.");
      }
    } catch (err: any) {
      setError("An external networking error occurred. Please verify sandbox hosts.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Verify MFA Second Factor
  const verifyMfaCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeToVerify = recoveryCodeString || mfaCode.join("");
    if (!codeToVerify) {
      setError("Please input OTP verification code or security recovery key.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mfaCode: codeToVerify,
          device: {
            deviceId: "chrome_desktop_mac",
            browser: "Chrome 124",
            os: "macOS 14",
            ip: "103.45.1.92",
            location: "Mumbai, India"
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("quantmind_token", data.token);
        setSuccess("MFA validation complete. Credentials ledger established!");
        
        setTimeout(() => {
          onLoginSuccess({
            id: data.user.id,
            firstName: data.user.name.split(" ")[0] || "Jane",
            lastName: data.user.name.split(" ").slice(1).join(" ") || "Doe",
            email: data.user.email,
            mobile: data.user.mobile,
            role: data.user.role,
            isLoggedIn: true,
            token: data.token,
            mfaEnabled: data.user.mfaEnabled,
            mfaType: data.user.mfaType
          });
        }, 1500);
      } else {
        setError(data.error || "Invalid MFA second factor security key.");
      }
    } catch (err) {
      setError("MFA authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Forgot Password Initial Dispatch
  const requestForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setMode("RESET");
        setSimulatedInbox({
          title: "🛠️ Reset Code Queued",
          message: "Use the secure reset credential below inside the screen wizard to restore account access.",
          code: data.demoResetToken
        });
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Password recovery server failure.");
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Reset Password Apply
  const executePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Confirm password must equal new password.");
      return;
    }
    if (!resetToken) {
      setError("Please key in the reset validation token sent to your outbox.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: resetToken,
          newPassword: password
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setMode("LOGIN");
        setSimulatedInbox({
          title: "🔐 Vault Password Synced",
          message: "Vault access keys has been rotated. Use the new credentials to access dashboard."
        });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to rotate key.");
    } finally {
      setLoading(false);
    }
  };

  // Paste handler for fast multi-field code input
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, targetStateSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const charArr = pastedData.split("");
      targetStateSetter(charArr);
      const inputs = document.querySelectorAll(".otp-digit-input");
      if (inputs.length === 6) {
        (inputs[5] as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpDigitChange = (index: number, val: string, digitsArr: string[], stateSetter: React.Dispatch<React.SetStateAction<string[]>>, inputClassName: string) => {
    if (!/^\d*$/.test(val)) return;
    const copied = [...digitsArr];
    copied[index] = val.slice(-1);
    stateSetter(copied);

    // Auto-focus move
    if (val && index < 5) {
      const nextEl = document.getElementById(`${inputClassName}-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, key: string, digitsArr: string[], stateSetter: React.Dispatch<React.SetStateAction<string[]>>, inputClassName: string) => {
    if (key === "Backspace" && !digitsArr[index] && index > 0) {
      const prevEl = document.getElementById(`${inputClassName}-${index - 1}`);
      prevEl?.focus();
      const copied = [...digitsArr];
      copied[index - 1] = "";
      stateSetter(copied);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col xl:flex-row items-center justify-center relative overflow-hidden p-4 md:p-6 lg:p-8" id="secure-sandbox-root">
      
      {/* Background radial atmosphere grids */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main split grid layout for extreme high fidelity */}
      <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 relative z-10 items-stretch" id="auth-experience-grid">
        
        {/* Left column: Branding & Live Dev Sandbox notification log (Outbox Monitor) */}
        <div className="xl:col-span-5 flex flex-col justify-between space-y-6 text-slate-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <BarChart2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                  QuantMind <span className="text-indigo-400">AI</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">Institutional Analytics Ledger</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Welcome to the QuantMind institutional-grade financial security gateway. Engineered in compliance with SEBI and global clearing standards, featuring strict cryptographic token rotation, and multi-factor validation grids.
            </p>
          </div>

          {/* SIMULATED LIVE SANBOX MONITOR (OUTBOX/SMS INTERCEPTOR) */}
          <div className="bg-slate-900/60 border border-indigo-500/15 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden shadow-xl" id="sms-sim-drawer">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-1">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-bold">Secure Sandbox Telemetry</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Mailbox Simulator</span>
            </div>

            <AnimatePresence mode="wait">
              {simulatedInbox ? (
                <motion.div 
                  key={simulatedInbox.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2.5 text-xs text-slate-300"
                >
                  <p className="font-semibold text-slate-100 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {simulatedInbox.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {simulatedInbox.message}
                  </p>

                  {simulatedInbox.code && (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between mt-1 animate-pulse">
                      <div>
                        <span className="block text-[8px] text-indigo-400 font-mono uppercase font-bold">Cryptographic Challenge OTP:</span>
                        <span className="text-base font-bold font-mono tracking-widest text-indigo-305">{simulatedInbox.code}</span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedInbox.code || "");
                          // Copy animation or toast
                        }}
                        className="p-1 px-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/20 text-[9px] text-indigo-300 font-mono font-bold rounded-md transition cursor-pointer"
                      >
                        Copy Key
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="py-6 text-center text-[11px] text-slate-500 font-mono">
                  Listening for transactional dispatches on local ports...
                </div>
              )}
            </AnimatePresence>

            <div className="border-t border-slate-800/60 pt-3.5 mt-3.5 flex flex-col md:flex-row gap-2 justify-between items-start md:items-center text-[9px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SSL 256-BIT CRYPTO ACTIVE
              </span>
              <span>VER: QMAP-v2.60</span>
            </div>
          </div>
        </div>

        {/* Right column: Auth glassware wizard Card */}
        <div className="xl:col-span-7 flex flex-col justify-center">
          <div className="bg-slate-900/50 border border-slate-800/85 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl relative" id="auth-glass-container">
            
            {/* Header with quick-switching tabs only for primary states */}
            {(mode === "LOGIN" || mode === "REGISTER") && (
              <div className="flex border-b border-slate-800/80 mb-6 pb-0.5">
                <button
                  onClick={() => { setMode("LOGIN"); setError(""); setSuccess(""); }}
                  className={`pb-3 text-sm font-semibold tracking-tight transition-all relative ${mode === "LOGIN" ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Institutional Login
                  {mode === "LOGIN" && <motion.div layoutId="authUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
                <button
                  onClick={() => { setMode("REGISTER"); setError(""); setSuccess(""); }}
                  className={`pb-3 text-sm font-semibold tracking-tight ml-6 transition-all relative ${mode === "REGISTER" ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Create Asset Account
                  {mode === "REGISTER" && <motion.div layoutId="authUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
              </div>
            )}

            {/* ERROR AND SUCCESS DISPLAYS */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl text-[11px] flex items-start space-x-2.5"
                id="security-error-banner"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-normal">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-5 p-3.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-xl text-[11px] flex items-start space-x-2.5"
                id="security-success-banner"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                <p className="leading-normal">{success}</p>
              </motion.div>
            )}

            {/* DYNAMIC CARD VIEW ROUTER */}
            <AnimatePresence mode="wait">
              
              {/* STAGE: SECURE LOGIN */}
              {mode === "LOGIN" && (
                <motion.form 
                  key="login-view"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleClientLogin}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Corporate Identity (Email or Mobile)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Mail className="w-4 h-4 text-indigo-400" />
                      </span>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="quantadvisor@goldman-sachs.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold">Secure Access Key</label>
                      <button 
                        type="button"
                        onClick={() => setMode("FORGOT")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Reset Secret?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="w-4 h-4 text-indigo-400" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA TURNSTILE COMPONENT */}
                  <div className="pt-2">
                    {renderCaptchaSimulation()}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !captchaVerified}
                    className="w-full mt-4 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-650 disabled:hover:shadow-none hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LockKeyhole className="w-3.5 h-3.5" />}
                    <span>{loading ? "Authorizing Security..." : "Unlock Security Terminal"}</span>
                  </button>
                </motion.form>
              )}

              {/* STAGE: SECURE USER REGISTRATION */}
              {mode === "REGISTER" && (
                <motion.form 
                  key="register-view"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={triggerRegistration}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Investor Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <User className="w-4 h-4 text-indigo-400" />
                        </span>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Indian Contact Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <Phone className="w-4 h-4 text-indigo-400" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Corporate Email Index</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Mail className="w-4 h-4 text-indigo-400" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="investor@quantmind-fiduciary.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Terminal Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <Lock className="w-4 h-4 text-indigo-400" />
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Confirm Secret</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <Check className="w-4 h-4 text-indigo-400" />
                        </span>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD POLICY METER */}
                  <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">PASSWORD RESILIENCE CAP:</span>
                      <span className={`${strengthInfo.score <= 2 ? "text-red-400" : strengthInfo.score <= 4 ? "text-amber-400" : "text-emerald-400"} font-bold`}>
                        {strengthInfo.label} ({strengthInfo.score}/5)
                      </span>
                    </div>
                    {/* Meter tracks */}
                    <div className="h-1 w-full bg-slate-800 rounded-full flex gap-1 overflow-hidden">
                      {Array(5).fill("").map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-full flex-1 transition-all ${idx < strengthInfo.score ? strengthInfo.color : "bg-transparent"}`} 
                        />
                      ))}
                    </div>
                    {/* Live bullet metrics */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-400 font-mono">
                      <div className="flex items-center space-x-1">
                        <Check className={`w-3 h-3 ${password.length >= 8 ? "text-emerald-400" : "text-slate-600"}`} />
                        <span>Length &gt;= 8 chars</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Check className={`w-3 h-3 ${/[A-Z]/.test(password) ? "text-emerald-400" : "text-slate-600"}`} />
                        <span>Uppercase key [A-Z]</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Check className={`w-3 h-3 ${/[a-z]/.test(password) ? "text-emerald-400" : "text-slate-600"}`} />
                        <span>Lowercase key [a-z]</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Check className={`w-3 h-3 ${/\d/.test(password) ? "text-emerald-400" : "text-slate-600"}`} />
                        <span>Number digit [0-9]</span>
                      </div>
                    </div>
                  </div>

                  {/* CAPTCHA */}
                  {renderCaptchaSimulation()}

                  <button
                    type="submit"
                    disabled={loading || !captchaVerified}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-650 text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>{loading ? "Allocating Fiduciary Space..." : "Initiate Fiduciary Account"}</span>
                  </button>
                </motion.form>
              )}

              {/* STAGE: OTP PHONE/EMAIL VERIFICATION */}
              {mode === "OTP_VERIFY" && (
                <motion.form 
                  key="otp-verify-view"
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0 }}
                  onSubmit={verifyRegistrationOtp}
                  className="space-y-5 text-xs text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full mb-3">
                      <Smartphone className="w-6 h-6 animate-bounce" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Security OTP Verification Required</h3>
                    <p className="text-slate-405 text-[11px] mt-1 max-w-sm mx-auto">
                      Authorized SEBI compliance regulations demand a validation callback. A 6-digit numeric security token has been wired to <span className="text-indigo-300 font-semibold">{email}</span>.
                    </p>
                  </div>

                  {/* Digit slots */}
                  <div className="flex justify-center gap-2 md:gap-3 py-1">
                    {verificationOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-digit-${index}`}
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onPaste={(e) => handleOtpPaste(e, setVerificationOtp)}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value, verificationOtp, setVerificationOtp, "otp-digit")}
                        onKeyDown={(e) => handleOtpDigitKeyDown(index, e.key, verificationOtp, setVerificationOtp, "otp-digit")}
                        className="w-10 h-12 text-center text-lg font-bold bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550 rounded-lg text-slate-100 rounded-lg focus:outline-none transition otp-digit-input"
                      />
                    ))}
                  </div>

                  {/* Expiration timing */}
                  <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg text-[10px] font-mono border border-slate-900 mx-auto max-w-sm">
                    <span className="text-slate-505">TOKEN EXPIRES IN:</span>
                    <span className={`font-bold ${timerSeconds < 60 ? "text-red-400 animate-pulse" : "text-indigo-400"}`}>
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMode("LOGIN")}
                      className="text-slate-400 hover:text-slate-205 font-medium transition"
                    >
                      Return to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={resendVerificationCode}
                      disabled={loading || timerSeconds > 240}
                      className="text-indigo-400 hover:text-indigo-305 font-semibold transition disabled:opacity-40"
                    >
                      Resend Challenge OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Authorize Cryptographic Key</span>
                  </button>
                </motion.form>
              )}

              {/* STAGE: MFA DUAL CHALLENGE SHEET */}
              {mode === "MFA_CHALLENGE" && (
                <motion.form 
                  key="mfa-challenge-view"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onSubmit={verifyMfaCode}
                  className="space-y-4 text-xs"
                >
                  <div className="text-center flex flex-col items-center">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-3">
                      <LockKeyhole className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Multi-Factor Access Card</h3>
                    <p className="text-slate-400 text-[10px] sm:text-[11px] mt-1 max-w-sm">
                      This corporate ledger is protected by active second-factor checks. Enter your 6-digit email confirmation token or a 10-character offline recovery backup code.
                    </p>
                  </div>

                  {/* Switchable selection depending on if user wants OTP or backup sheet */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-slate-500 text-[9px] font-mono tracking-wider uppercase mb-1.5 font-bold">OPTION A: 6-DIGIT MULTI-FACTOR PASSCODE</label>
                      <div className="flex justify-center gap-2 md:gap-3 py-1">
                        {mfaCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`mfa-digit-${index}`}
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onPaste={(e) => handleOtpPaste(e, setMfaCode)}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value, mfaCode, setMfaCode, "mfa-digit")}
                            onKeyDown={(e) => handleOtpDigitKeyDown(index, e.key, mfaCode, setMfaCode, "mfa-digit")}
                            className="w-10 h-12 text-center text-lg font-bold bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550 rounded-lg text-slate-100 rounded-lg focus:outline-none transition"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-slate-600 text-[9px] font-mono uppercase">OR</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[9px] font-mono tracking-wider uppercase mb-1.5 font-bold">OPTION B: SECURE COLD BACKUP RECOVERY KEY</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                          <KeyRound className="w-4 h-4 text-emerald-400" />
                        </span>
                        <input
                          type="text"
                          value={recoveryCodeString}
                          onChange={(e) => setRecoveryCodeString(e.target.value.toUpperCase())}
                          placeholder="GS-8402-9182"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700/60 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none placeholder-slate-600 transition tracking-wider font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] mt-4">
                    <button
                      type="button"
                      onClick={() => setMode("LOGIN")}
                      className="text-slate-400 hover:text-slate-205 transition font-medium"
                    >
                      Cancel Callback
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">CHALLENGE TIMEOUT: {formatTimer(timerSeconds)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Submit Multi-Factor Tokens</span>
                  </button>
                </motion.form>
              )}

              {/* STAGE: PASSWORD RECOVERY (FORGOT EMAIL ENROLL) */}
              {mode === "FORGOT" && (
                <motion.form 
                  key="forgot-view"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onSubmit={requestForgotPassword}
                  className="space-y-4 text-xs"
                >
                  <div className="text-center flex flex-col items-center">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full mb-3">
                      <KeyRound className="w-6 h-6 animate-spin" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Access Key Recovery System</h3>
                    <p className="text-slate-400 text-[11px] mt-1 max-w-sm-text">
                      Provide your registered corporate email index. The security module will process client status checks and queue a reset clearance token.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Linked Client Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Mail className="w-4 h-4 text-indigo-400" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="investor@goldman-sachs.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700/60 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("LOGIN")}
                      className="text-slate-400 hover:text-slate-200 transition"
                    >
                      Return to Sign In
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Dispatch Recovery Challenge</span>
                  </button>
                </motion.form>
              )}

              {/* STAGE: APPLY RESET PASSWORD */}
              {mode === "RESET" && (
                <motion.form 
                  key="reset-view"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onSubmit={executePasswordReset}
                  className="space-y-4 text-xs"
                >
                  <div className="text-center flex flex-col items-center">
                    <h3 className="text-sm font-bold text-white tracking-tight">Configure New Security Keys</h3>
                    <p className="text-slate-400 text-[11px] mt-1">
                      An access reset token has been dispatched. Authenticate the key below and configure your new standard password credentials.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Secure Reset Token</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Shield className="w-4 h-4 text-indigo-400" />
                      </span>
                      <input
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                        placeholder="RESET-XXXXX"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none placeholder-slate-600 transition font-mono uppercase tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">New Vault Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700/60 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-slate-700/60 focus:border-indigo-500 rounded-xl text-slate-100 text-xs focus:outline-none placeholder-slate-600 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Commit Password Changes</span>
                  </button>
                </motion.form>
              )}

            </AnimatePresence>

            {/* BACKUP CODES INTERCEPT OVERLAY SUCCESS */}
            {backupCodesReceived.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 bg-slate-900 border border-indigo-500/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between z-20"
                id="backup-codes-sheet"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-3">
                    <ShieldCheck className="w-6 h-6 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold tracking-wider font-mono text-white uppercase">Vault Master Keys Dispatched</h4>
                      <p className="text-[10px] text-slate-500">SEBI-Grade Cryptographic Backup Tokens</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    These offline backup recovery key sequences are mathematically aligned with your investor ID. Store them offline. Used sheets will instantly void on execution.
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-4">
                    {backupCodesReceived.map((code, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center text-xs font-mono font-bold text-emerald-400 select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      const text = `QUANTMIND WALLET BACKUP KEYS\nUser Email: ${email}\nDate: ${new Date().toLocaleDateString()}\n\nCodes:\n` + backupCodesReceived.join("\n");
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "quantmind_fiduciary_keys.txt";
                      a.click();
                    }}
                    className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 font-semibold rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Key File</span>
                  </button>
                  <button
                    onClick={() => {
                      // Trigger main login Success
                      setBackupCodesReceived([]);
                    }}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>Proceed to Wealth Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );

  // Cloudflare Turnstile simulation block
  function renderCaptchaSimulation() {
    return (
      <div 
        className="border border-slate-800 bg-slate-950/60 p-3 rounded-xl select-none"
        id="turnstile-bot-barrier"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-550" />
            BOT PROTECTION LEVEL: ACTIVE
          </span>
          <span className={`${captchaVerified ? "text-emerald-400 font-bold" : "text-amber-400"}`}>
            {captchaVerified ? "SIGNATURE VERIFIED" : "VERIFICATION PENDING"}
          </span>
        </div>

        <div 
          onClick={() => {
            if (!captchaVerified) {
              setCaptchaVerified(true);
              setCaptchaProgress(100);
              setSimulatedInbox({
                title: "Cloudflare Turnstile Verified",
                message: "Bot protection cleared successfully. Client device signature verified as humane.",
              });
            }
          }}
          className={`h-11 rounded-lg border flex items-center justify-between px-3 relative overflow-hidden transition cursor-pointer ${
            captchaVerified 
              ? "bg-emerald-950/15 border-emerald-500/35" 
              : "bg-slate-900/40 border-slate-800 hover:border-slate-750"
          }`}
        >
          <div className="flex items-center space-x-2.5 z-10">
            {captchaVerified ? (
              <div className="p-1 bg-emerald-550/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                <Check className="w-3.5 h-3.5 animate-pulse" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded border border-indigo-500/50 flex items-center justify-center bg-indigo-500/10 shrink-0">
                <div className="w-1.5 h-1.5 rounded-sm bg-indigo-400 animate-ping" />
              </div>
            )}
            <span className={`text-[11px] font-medium tracking-tight ${captchaVerified ? "text-emerald-300" : "text-slate-400"}`}>
              {captchaVerified ? "I am human (Client Signature Passed)" : "Verify client signature (Click to clear reCAPTCHA)"}
            </span>
          </div>

          <span className="text-[10px] text-slate-600 font-mono z-10 shrink-0">Cloudflare</span>
        </div>
      </div>
    );
  }
}
