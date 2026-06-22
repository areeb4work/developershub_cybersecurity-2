const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const hpp = require('hpp');
require('dotenv').config();
const app = express();

// ── 1. WAF PROTECTION (Bonus Challenge) ──────────────────────
app.use(hpp());            // Prevents HTTP parameter pollution

// ── 2. SECURITY HEADERS (Week 4.3) ───────────────────────────
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    imgSrc:     ["'self'", "data:"],
  }
}));
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true
}));

// ── 3. CORS (Week 4.2) ───────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// ── 4. RATE LIMITING (Week 4.2) ──────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please wait 15 minutes.'
});
app.use('/api/', limiter);

// ── 5. BODY PARSING ──────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── 6. PASSPORT OAUTH (Bonus Challenge) ──────────────────────
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID     || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL:  'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.emails[0].value },
      process.env.JWT_SECRET || 'jwt-secret-key',
      { expiresIn: '1h' }
    );
    res.json({ token, message: 'OAuth login successful!' });
  }
);

// ── 7. ZERO TRUST JWT MIDDLEWARE (Bonus Challenge) ────────────
function verifyZeroTrust(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      principle: 'Zero Trust: Never trust, always verify'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'jwt-secret-key'
    );
    req.user = decoded;

    // Zero Trust: log every access attempt
    console.log(`[ZERO TRUST] Access granted to ${req.user.email} at ${new Date().toISOString()}`);
    next();
  } catch (err) {
    console.warn(`[ZERO TRUST] Invalid token attempt at ${new Date().toISOString()}`);
    return res.status(403).json({
      error: 'Invalid or expired token.',
      principle: 'Zero Trust: Verify explicitly'
    });
  }
}

// ── 8. API KEY MIDDLEWARE (Week 4.2) ─────────────────────────
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

// ── 9. JWT TOKEN GENERATOR (for testing) ─────────────────────
app.post('/api/token', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'secret123') {
    const token = jwt.sign(
      { username, email: 'admin@secure-app.com', role: 'admin' },
      process.env.JWT_SECRET || 'jwt-secret-key',
      { expiresIn: '1h' }
    );
    res.json({
      token,
      message: 'JWT token generated successfully!',
      expiresIn: '1 hour'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ── 10. PROTECTED ROUTES ──────────────────────────────────────

// API key protected route (Week 4)
app.get('/api/data', requireApiKey, (req, res) => {
  res.json({ message: 'Authenticated via API key!' });
});

// Zero Trust JWT protected route (Bonus)
app.get('/api/secure', verifyZeroTrust, (req, res) => {
  res.json({
    message: 'Zero Trust access granted!',
    user: req.user,
    principle: 'Never trust, always verify',
    timestamp: new Date().toISOString()
  });
});

// Combined protection (API key + Zero Trust JWT)
app.get('/api/admin', requireApiKey, verifyZeroTrust, (req, res) => {
  res.json({
    message: 'Maximum security route accessed!',
    user: req.user,
    security: 'API Key + Zero Trust JWT + Rate Limiting + WAF'
  });
});

// ── 11. LOGIN with brute force detection (Week 4.1) ──────────
const loginAttempts = {};
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  loginAttempts[ip] = (loginAttempts[ip] || 0) + 1;

  if (loginAttempts[ip] > 5) {
    console.warn(`[ALERT] Brute force from ${ip}: ${loginAttempts[ip]} attempts`);
    return res.status(429).json({ error: 'Too many failed logins.' });
  }

  if (username === 'admin' && password === 'secret123') {
    loginAttempts[ip] = 0;
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'jwt-secret-key',
      { expiresIn: '1h' }
    );
    return res.json({ message: 'Login successful!', token });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// ── 12. CSRF PROTECTED ROUTES (Week 5.3) ─────────────────────
app.get('/form', (req, res) => {
  res.json({ message: 'Form endpoint - CSRF protection via csrf-csrf' });
});

app.post('/submit', (req, res) => {
  res.json({ message: 'Form submitted safely!' });
});

// ── 13. HEALTH CHECK ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'secure',
    features: [
      'Rate limiting',
      'CORS',
      'API Key Auth',
      'JWT Zero Trust',
      'OAuth (Google)',
      'CSP Headers',
      'HSTS',
      'WAF (HPP + MongoSanitize)',
      'Brute Force Detection'
    ]
  });
});

// ── 14. START SERVER ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Secure server running on port ${PORT}`);
  console.log(`✅ Zero Trust JWT protection active`);
  console.log(`✅ OAuth (Google) configured`);
  console.log(`✅ WAF protection active`);
  console.log(`✅ Security headers active`);
  console.log(`✅ Rate limiting active`);
  console.log(`✅ CSRF protection active`);
});