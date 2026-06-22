# 🔐 Cybersecurity Internship - Weeks (4-6)
### Developershub Corporation | Intern: Areeb Ahsan
### GitHub: areeb4work/developershub_cybersecurity-2

---

## 📋 Overview

This repository contains the complete implementation of advanced cybersecurity tasks completed during Weeks 4-6 of the Developershub Corporation cybersecurity internship program. The project demonstrates real-world security engineering including API hardening, ethical hacking, vulnerability scanning, and secure deployment practices.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/areeb4work/developershub_cybersecurity-2.git
cd developershub_cybersecurity-2

# Install dependencies
npm install

# Create your .env file (see Environment Variables section)
cp .env.example .env

# Run the secure server
node server.js
```

Server starts at: `http://localhost:3000`

---

## 🛡️ Security Features Implemented

### Week 4 - API Security & Threat Detection

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Rate Limiting | `express-rate-limit` | Blocks brute force - 100 req/15 min |
| CORS | `cors` middleware | Restricts access to localhost:3000 only |
| API Key Auth | Custom middleware | All /api/ routes require x-api-key header |
| Content Security Policy | `helmet.contentSecurityPolicy()` | Prevents XSS script injection |
| HSTS | `helmet.hsts({maxAge: 31536000})` | Enforces HTTPS permanently |
| X-Frame-Options | `helmet()` default | Prevents clickjacking attacks |
| X-Content-Type-Options | `helmet()` default | Prevents MIME type sniffing |
| Brute Force Detection | Custom `loginAttempts` tracker | Alerts after 5 failed login attempts |
| Fail2Ban | Kali Linux service | Auto-bans IPs after repeated failures |

### Week 5 - Ethical Hacking Fixes

| Vulnerability Found | Tool Used | Fix Applied |
|--------------------|-----------|-------------|
| SQL Injection (3 types) | SQLMap v1.10.6 | Prepared statements in `db.js` |
| CSRF Vulnerability | OWASP ZAP 2.17.0 | `csrf-csrf` middleware |
| Missing Security Headers | OWASP ZAP 2.17.0 | Helmet.js comprehensive headers |

### Week 6 - Security Audit Results

| Tool | Findings | Status |
|------|----------|--------|
| OWASP ZAP | 57 alerts found | Headers + CSRF fixed |
| Nikto | 16 vulnerabilities found | Documented + fixed |
| Lynis | Hardening score: 65/100 | Firewall + Fail2Ban active |
| npm audit | 0 vulnerabilities | csurf replaced with csrf-csrf |
| Docker Scout | 16 CVEs in base image | Documented, base image update recommended |
| Metasploit | EXPLOIT* flag, 100+ Apache modules | DVWA-specific findings documented |

### Bonus Challenges ✅

| Challenge | Implementation | Status |
|-----------|---------------|--------|
| Zero Trust Security | JWT tokens on every request (`jsonwebtoken`) | ✅ COMPLETE |
| Google OAuth 2.0 | `passport-google-oauth20` | ✅ COMPLETE |
| Web Application Firewall | HPP middleware (`hpp`) | ✅ COMPLETE |
| Social Engineering Simulation | Phishing/Pretexting documented in report | ✅ COMPLETE |

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
API_KEY=my-super-secret-key-123
PORT=3000
NODE_ENV=development
JWT_SECRET=super-secret-jwt-key-2026
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> ⚠️ **NEVER commit your `.env` file to GitHub. It is already in `.gitignore`.**

---

## 🧪 Testing the API

### Test 1 - API Key Protection
```bash
# Without API key (expect 401 Unauthorized)
curl http://localhost:3000/api/data

# With correct API key (expect 200 OK)
curl http://localhost:3000/api/data -H "x-api-key: my-super-secret-key-123"
```

### Test 2 - Zero Trust JWT
```bash
# Generate JWT token
curl -X POST http://localhost:3000/api/token \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"secret123\"}"

# Use JWT on protected route
curl http://localhost:3000/api/secure \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Test 3 - Google OAuth
```
Open browser: http://localhost:3000/auth/google
→ Redirects to Google login
→ Returns JWT token on success
```

### Test 4 - Health Check
```bash
curl http://localhost:3000/health
```
Returns all active security features.

---

## 📁 Project Structure

```
developershub_cybersecurity-2/
│
├── server.js                    # Main secure Express server
├── db.js                        # Database with prepared statements (SQLi prevention)
├── Dockerfile                   # Secure Docker configuration
├── package.json                 # Dependencies
├── .env                         # Environment variables (NOT in GitHub)
├── .gitignore                   # Files excluded from GitHub
│
├── reports/
│   ├── Comprehensive_Security_Report_Areeb_Ahsan.docx
│   ├── Penetration_Testing_Report_Areeb_Ahsan.docx
│   ├── Social_Engineering_Report_Areeb_Ahsan.docx
│   ├── nikto-report.txt         # Nikto raw output
│   ├── lynis-report.txt         # Lynis raw output
│   ├── metasploit-report.xml    # Metasploit XML export
│   └── zap-report.html          # OWASP ZAP HTML report (57 alerts)
│
└── screenshots/
    ├── week4/                   # API security testing screenshots
    ├── week5/                   # SQLMap, ZAP, DVWA screenshots
    └── week6/                   # Nikto, Lynis, Docker, Metasploit screenshots
```

---

## 🔧 Tools Used

### Kali Linux Tools
```bash
# Install all at once
sudo apt install -y nmap sqlmap nikto lynis fail2ban metasploit-framework burpsuite
```

| Tool | Version | Purpose |
|------|---------|---------|
| SQLMap | v1.10.6 | SQL injection testing |
| OWASP ZAP | v2.17.0 | Web vulnerability scanner |
| Nikto | v2.6.0 | Web server scanner |
| Lynis | v3.1.6 | System security auditor |
| Fail2Ban | Latest | Intrusion detection |
| Metasploit | v6.4.135 | Penetration testing framework |
| Nmap | v7.99 | Network reconnaissance |

### Node.js Packages
```bash
npm install express helmet cors express-rate-limit dotenv \
            better-sqlite3 csrf-csrf cookie-parser \
            passport passport-google-oauth20 \
            jsonwebtoken hpp
```

---

## 🐳 Docker Deployment

```bash
# Build secure image
docker build -t my-secure-app .

# Run container
docker run -p 3000:3000 \
  -e API_KEY=your-secret-key \
  -e JWT_SECRET=your-jwt-secret \
  my-secure-app

# Scan for vulnerabilities
docker scout cves my-secure-app
```

### Docker Security Features
- ✅ Non-root user (`appuser`) — minimal privilege principle
- ✅ Alpine base image — minimal attack surface
- ✅ `npm ci --only=production` — no dev dependencies
- ✅ Image scanned with Docker Scout — 16 CVEs documented

---

## 🔍 SQL Injection Prevention

```javascript
// ❌ VULNERABLE (never do this):
const user = db.query(`SELECT * FROM users WHERE username = '${username}'`);

// ✅ SAFE — Prepared Statement (always use this):
const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
const user = stmt.get(username);
```

---

## 🛡️ OWASP Top 10 Compliance

| Risk | Status |
|------|--------|
| A01: Broken Access Control | ✅ API Key + JWT Zero Trust |
| A02: Cryptographic Failures | ✅ HSTS enforces HTTPS |
| A03: Injection | ✅ Prepared statements |
| A04: Insecure Design | ✅ Security-first architecture |
| A05: Security Misconfiguration | ✅ Helmet.js + CORS |
| A06: Vulnerable Components | ✅ npm audit: 0 vulnerabilities |
| A07: Auth & Session Failures | ✅ Rate limit + CSRF + OAuth |
| A08: Data Integrity Failures | ✅ csrf-csrf middleware |
| A09: Logging Failures | ✅ Brute force alerts + Zero Trust logs |
| A10: SSRF | ✅ Input validation |

---

## 📊 Security Audit Summary

```
Total Vulnerabilities Found:    96
  ├── OWASP ZAP:               57 alerts
  ├── Nikto:                   16 findings  
  ├── Metasploit:               7 findings
  └── Docker Scout:            16 CVEs

Vulnerabilities Fixed:          ALL CRITICAL
npm audit:                      0 vulnerabilities
Lynis Hardening Score:         65/100
OWASP Top 10:                  10/10 Compliant
Bonus Challenges:              3/3 Complete
```

---

## 📹 Video Walkthrough

A 4-5 minute video recording demonstrates:
- Server.js security features walkthrough
- ZAP scan results and findings
- SQLMap SQL injection demonstration
- GitHub repository overview
- OWASP Top 10 compliance summary

---

## ⚠️ Ethical Hacking Disclaimer

All penetration testing was conducted on:
- **DVWA** (Damn Vulnerable Web Application) - intentionally insecure for training
- **localhost** - the intern's own machine only
- **Isolated lab environment** - no real systems were attacked

> All activities comply with ethical hacking principles and applicable laws. Tools like SQLMap, Metasploit, and Nikto were ONLY used against systems owned by and explicitly set up for this purpose.

---

## 👤 Author

**Areeb Ahsan**  
Cybersecurity Intern - Developershub Corporation  
GitHub: [@areeb4work](https://github.com/areeb4work)  
Repository: [developershub_cybersecurity-2](https://github.com/areeb4work/developershub_cybersecurity-2)

---

*Submitted for Cybersecurity Internship Weeks 4-6 | Deadline: 30 June 2026*
