import fs from "fs";
import path from "path";

// DB file path
const DB_FILE = path.join(process.cwd(), "db_quantmind_security.json");

// System Roles
export type RoleName = "ROLE_USER" | "ROLE_PREMIUM" | "ROLE_ADVISOR" | "ROLE_ADMIN";

export interface DBUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: RoleName;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "LOCKED";
  createdAt: string;
  mfaEnabled: boolean;
  mfaType: "EMAIL_OTP" | "AUTHENTICATOR" | "NONE";
  mfaSecret?: string;
  phoneNumberVerified: boolean;
}

export interface OTPVerification {
  id: string;
  email: string;
  otp: string;
  expiry: string;
  attempts: number;
  resendsCount: number;
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiry: string;
  revoked: boolean;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  token: string;
  deviceId: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  active: boolean;
  loginTime: string;
}

export interface LoginHistory {
  id: string;
  email: string;
  loginTime: string;
  success: boolean;
  ip: string;
  deviceInfo: string;
  failureReason?: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  email: string;
  eventType: "FAILED_LOGIN_ATTEMPT" | "ACCOUNT_LOCK_15" | "PASSWORD_CHANGE" | "MFA_ENABLED" | "MFA_DISABLED" | "UNKNOWN_DEVICE_ALERT" | "API_ABUSE" | "SESSION_REVOKED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  timestamp: string;
  ip: string;
  device: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string; // e.g., "USER_REGISTRATION", "KYC_SUBMISSION", "PORTFOLIO_UPDATE"
  details: string;
  timestamp: string;
  ip: string;
  device: string;
}

export interface RecoveryCode {
  id: string;
  userId: string;
  code: string;
  used: boolean;
  createdAt: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  browser: string;
  os: string;
  ip: string;
  isTrusted: boolean;
  lastAccess: string;
}

export interface SecurityNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "SECURITY" | "PORTFOLIO" | "MARKET" | "AI";
  read: boolean;
  createdAt: string;
}

export interface SecuritySchema {
  users: DBUser[];
  otpVerifications: OTPVerification[];
  refreshTokens: RefreshToken[];
  userSessions: UserSessionRecord[];
  loginHistory: LoginHistory[];
  securityEvents: SecurityEvent[];
  auditLogs: AuditLog[];
  recoveryCodes: RecoveryCode[];
  devices: UserDevice[];
  notifications: SecurityNotification[];
}

// Initial Seeding
const initialSchema: SecuritySchema = {
  users: [
    {
      id: "admin-id-123",
      name: "Jane Doe Admin",
      email: "quantadvisor@goldman-sachs.com",
      mobile: "+919876543210",
      passwordHash: "SecurePass123!", // Simplified plaintext mock password checking
      role: "ROLE_ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      mfaEnabled: true,
      mfaType: "EMAIL_OTP",
      phoneNumberVerified: true
    }
  ],
  otpVerifications: [],
  refreshTokens: [],
  userSessions: [],
  loginHistory: [
    {
      id: "H-1",
      email: "quantadvisor@goldman-sachs.com",
      loginTime: new Date(Date.now() - 3600000).toISOString(),
      success: true,
      ip: "103.45.1.92",
      deviceInfo: "Chrome 124 / macOS 14"
    }
  ],
  securityEvents: [
    {
      id: "SE-1",
      userId: "admin-id-123",
      email: "quantadvisor@goldman-sachs.com",
      eventType: "MFA_ENABLED",
      severity: "LOW",
      details: "Multi-Factor Authentication set up successfully via OTP module.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip: "103.45.1.92",
      device: "Chrome 124 / macOS 14"
    }
  ],
  auditLogs: [
    {
      id: "AL-1",
      userId: "admin-id-123",
      userEmail: "quantadvisor@goldman-sachs.com",
      action: "RECONCILE_SECURITY_DECK",
      details: "Institutional security audit keys verified successfully.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip: "103.45.1.92",
      device: "Chrome 124 / macOS 14"
    }
  ],
  recoveryCodes: [
    { id: "RC-1", userId: "admin-id-123", code: "GS-8402-9182", used: false, createdAt: new Date().toISOString() },
    { id: "RC-2", userId: "admin-id-123", code: "GS-4011-8930", used: false, createdAt: new Date().toISOString() },
    { id: "RC-3", userId: "admin-id-123", code: "GS-5722-1083", used: false, createdAt: new Date().toISOString() },
    { id: "RC-4", userId: "admin-id-123", code: "GS-9011-4710", used: false, createdAt: new Date().toISOString() }
  ],
  devices: [
    {
      id: "D-1",
      userId: "admin-id-123",
      deviceId: "dev_macbook_chrome",
      browser: "Chrome 124",
      os: "macOS 14",
      ip: "103.45.1.92",
      isTrusted: true,
      lastAccess: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "N-1",
      userId: "admin-id-123",
      title: "New Secure Login",
      message: "An institutional login was logged from IP 103.45.1.92.",
      type: "SECURITY",
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
};

// Database class helper
class SecurityDatabase {
  private data: SecuritySchema;

  constructor() {
    this.data = initialSchema;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load security database, seeding fresh indices...", e);
      this.data = initialSchema;
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to persist security database:", e);
    }
  }

  public findUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByMobile(mobile: string): DBUser | undefined {
    return this.data.users.find(u => u.mobile === mobile);
  }

  public findUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(user: DBUser) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(user: DBUser) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.data.users[idx] = user;
      this.save();
    }
  }

  // OTP Verifications
  public findOtpRecord(email: string): OTPVerification | undefined {
    return this.data.otpVerifications.find(o => o.email.toLowerCase() === email.toLowerCase());
  }

  public upsertOtpRecord(email: string, otp: string) {
    const existing = this.findOtpRecord(email);
    if (existing) {
      existing.otp = otp;
      existing.expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry
      existing.attempts = 0;
      existing.resendsCount += 1;
    } else {
      this.data.otpVerifications.push({
        id: "otp-" + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        otp,
        expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        attempts: 0,
        resendsCount: 0,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
  }

  public incrementOtpAttempts(email: string): number {
    const o = this.findOtpRecord(email);
    if (o) {
      o.attempts += 1;
      this.save();
      return o.attempts;
    }
    return 0;
  }

  public removeOtpRecord(email: string) {
    this.data.otpVerifications = this.data.otpVerifications.filter(o => o.email.toLowerCase() !== email.toLowerCase());
    this.save();
  }

  // Sessions and Refresh Tokens
  public createSession(userId: string, token: string, device: { browser: string; os: string; ip: string; location: string; deviceId: string }): UserSessionRecord {
    // Mark previous sessions revoked if needed or append
    const session: UserSessionRecord = {
      id: "SESS-" + Math.random().toString(36).substr(2, 9),
      userId,
      token,
      deviceId: device.deviceId,
      browser: device.browser,
      os: device.os,
      ip: device.ip,
      location: device.location,
      active: true,
      loginTime: new Date().toISOString()
    };
    this.data.userSessions.push(session);
    this.save();
    return session;
  }

  public findSessionByToken(token: string): UserSessionRecord | undefined {
    return this.data.userSessions.find(s => s.token === token && s.active);
  }

  public revokeSession(sessionId: string) {
    const s = this.data.userSessions.find(sess => sess.id === sessionId);
    if (s) {
      s.active = false;
      this.save();
    }
  }

  public revokeAllSessionsForUser(userId: string) {
    this.data.userSessions.forEach(s => {
      if (s.userId === userId) s.active = false;
    });
    this.save();
  }

  // Refresh tokens
  public createRefreshToken(userId: string, token: string): RefreshToken {
    const rt: RefreshToken = {
      id: "RT-" + Math.random().toString(36).substr(2, 9),
      token,
      userId,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      revoked: false
    };
    this.data.refreshTokens.push(rt);
    this.save();
    return rt;
  }

  public verifyAndRevokeRefreshToken(token: string): RefreshToken | undefined {
    const rt = this.data.refreshTokens.find(r => r.token === token && !r.revoked);
    if (rt) {
      const expired = new Date(rt.expiry) < new Date();
      if (!expired) {
        return rt;
      }
    }
    return undefined;
  }

  public revokeAllRefreshTokens(userId: string) {
    this.data.refreshTokens.forEach(rt => {
      if (rt.userId === userId) rt.revoked = true;
    });
    this.save();
  }

  // Devices
  public registerDevice(userId: string, d: { deviceId: string; browser: string; os: string; ip: string }): UserDevice {
    const existing = this.data.devices.find(dev => dev.userId === userId && dev.deviceId === d.deviceId);
    if (existing) {
      existing.lastAccess = new Date().toISOString();
      existing.ip = d.ip;
      this.save();
      return existing;
    } else {
      const newDev: UserDevice = {
        id: "DEV-" + Math.random().toString(36).substr(2, 9),
        userId,
        deviceId: d.deviceId,
        browser: d.browser,
        os: d.os,
        ip: d.ip,
        isTrusted: true,
        lastAccess: new Date().toISOString()
      };
      this.data.devices.push(newDev);
      this.save();
      return newDev;
    }
  }

  // Audit Logs, Login History, Security Events
  public addAuditLog(userId: string, email: string, action: string, details: string, ip: string, device: string) {
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.random().toString(36).substr(2, 9),
      userId,
      userEmail: email,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip,
      device
    });
    // Truncate to top 150 items to keep file sizes balanced
    if (this.data.auditLogs.length > 250) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 250);
    }
    this.save();
  }

  public addLoginHistory(email: string, success: boolean, ip: string, deviceInfo: string, failureReason?: string) {
    this.data.loginHistory.unshift({
      id: "LH-" + Math.random().toString(36).substr(2, 9),
      email,
      loginTime: new Date().toISOString(),
      success,
      ip,
      deviceInfo,
      failureReason
    });
    if (this.data.loginHistory.length > 250) {
      this.data.loginHistory = this.data.loginHistory.slice(0, 250);
    }
    this.save();
  }

  public addSecurityEvent(userId: string, email: string, eventType: SecurityEvent["eventType"], severity: SecurityEvent["severity"], details: string, ip: string, device: string) {
    this.data.securityEvents.unshift({
      id: "SEC-" + Math.random().toString(36).substr(2, 9),
      userId,
      email,
      eventType,
      severity,
      details,
      timestamp: new Date().toISOString(),
      ip,
      device
    });
    if (this.data.securityEvents.length > 250) {
      this.data.securityEvents = this.data.securityEvents.slice(0, 250);
    }
    
    // Auto-create alert notification
    this.addNotification(userId || "system", `Security Alert: ${eventType}`, details, "SECURITY");
    this.save();
  }

  // Recovery codes
  public findRecoveryCodesForUser(userId: string): RecoveryCode[] {
    return this.data.recoveryCodes.filter(rc => rc.userId === userId);
  }

  public regenerateRecoveryCodes(userId: string): string[] {
    // clear old codes
    this.data.recoveryCodes = this.data.recoveryCodes.filter(rc => rc.userId !== userId);
    const codes: string[] = [];
    for (let i = 0; i < 4; i++) {
      const chunk1 = Math.floor(1000 + Math.random() * 9000);
      const chunk2 = Math.floor(1000 + Math.random() * 9000);
      const code = `GS-${chunk1}-${chunk2}`;
      codes.push(code);
      this.data.recoveryCodes.push({
        id: "RC-" + Math.random().toString(36).substr(2, 9),
        userId,
        code,
        used: false,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
    return codes;
  }

  public useRecoveryCode(userId: string, code: string): boolean {
    const rc = this.data.recoveryCodes.find(item => item.userId === userId && item.code === code && !item.used);
    if (rc) {
      rc.used = true;
      this.save();
      return true;
    }
    return false;
  }

  // Notifications
  public findNotificationsForUser(userId: string): SecurityNotification[] {
    return this.data.notifications.filter(n => n.userId === userId || n.userId === "all");
  }

  public addNotification(userId: string, title: string, message: string, type: SecurityNotification["type"]) {
    this.data.notifications.unshift({
      id: "NOT-" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    });
    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }
    this.save();
  }

  public markNotificationRead(id: string) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  public markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Exposure of internal logs
  public getLogsForUser(userId: string) {
    const user = this.findUserById(userId);
    const email = user?.email || "";
    return {
      sessions: this.data.userSessions.filter(s => s.userId === userId),
      loginHistory: this.data.loginHistory.filter(lh => lh.email.toLowerCase() === email.toLowerCase()),
      securityEvents: this.data.securityEvents.filter(se => se.userId === userId || se.email.toLowerCase() === email.toLowerCase()),
      auditLogs: this.data.auditLogs.filter(al => al.userId === userId || al.userEmail.toLowerCase() === email.toLowerCase()),
      devices: this.data.devices.filter(d => d.userId === userId),
      recoveryCodes: this.data.recoveryCodes.filter(rc => rc.userId === userId)
    };
  }

  // Admin Methods
  public getAllUsers(): DBUser[] {
    return this.data.users;
  }

  public getAllLoginHistory(): LoginHistory[] {
    return this.data.loginHistory;
  }

  public getAllSecurityEvents(): SecurityEvent[] {
    return this.data.securityEvents;
  }

  public getAllAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getAllSessions(): UserSessionRecord[] {
    return this.data.userSessions;
  }

  public adminUpdateUser(userId: string, updates: Partial<DBUser>): boolean {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.data.users[idx] = {
        ...this.data.users[idx],
        ...updates
      };
      this.save();
      return true;
    }
    return false;
  }

  public adminDeleteUser(userId: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    if (this.data.users.length < initialLen) {
      // Also delete sessions
      this.data.userSessions = this.data.userSessions.filter(s => s.userId !== userId);
      this.save();
      return true;
    }
    return false;
  }
}

export const securityDb = new SecurityDatabase();
