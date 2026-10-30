require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  'https://speaken.onrender.com/api/auth/google/callback';

const googleOAuthClient =
  googleClientId && googleClientSecret
    ? new OAuth2Client(
        googleClientId,
        googleClientSecret,
        googleCallbackUrl
      )
    : null;

const frontendUrl = 'https://speakken.netlify.app';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://speakken.netlify.app'
  ],
  credentials: true
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const isProduction = process.env.NODE_ENV === 'production';

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const authCookieClearOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error('Failed to send email');
  }

  return data;
}

app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'ТВОЙ_EMAIL',
      subject: 'SpeaKen email test',
      html: '<h1>Email works!</h1><p>Resend is connected.</p>',
    });

    res.json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Email sending failed' });
  }
});

function getTokenFromCookie(req) {
  const cookies = req.headers.cookie || '';

  for (const part of cookies.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    if (name !== 'speaken_token') continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

function createAuthToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function setAuthCookie(res, user) {
  res.cookie('speaken_token', createAuthToken(user), authCookieOptions);
}

function readCookie(req, name) {
  const cookies = req.headers.cookie || '';

  for (const part of cookies.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }

  return null;
}

const oauthCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 10 * 60 * 1000,
};

app.get('/api/auth/google', (req, res) => {
  if (!googleOAuthClient) {
    return res.status(503).json({
      error: 'Google login is not configured',
    });
  }

  const state = crypto.randomBytes(32).toString('hex');

  const requestedPath = req.query.returnTo;
  const returnTo =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    !requestedPath.includes('\\')
      ? requestedPath
      : '/';

  res.cookie('speaken_oauth_state', state, oauthCookieOptions);
  res.cookie(
    'speaken_oauth_return',
    encodeURIComponent(returnTo),
    oauthCookieOptions
  );

  const url = googleOAuthClient.generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });

  return res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const stateCookie = readCookie(req, 'speaken_oauth_state');
  const returnCookie = readCookie(req, 'speaken_oauth_return');

    console.log('OAuth state debug:', {
    hasStateCookie: Boolean(stateCookie),
    hasQueryState: typeof req.query.state === 'string',
    stateMatches: Boolean(
      stateCookie &&
      typeof req.query.state === 'string' &&
      req.query.state === stateCookie
    ),
  });

  res.clearCookie('speaken_oauth_state', {
    ...oauthCookieOptions,
    maxAge: undefined,
  });
  res.clearCookie('speaken_oauth_return', {
    ...oauthCookieOptions,
    maxAge: undefined,
  });

  if (!googleOAuthClient) {
    return res.status(503).send('Google login is not configured');
  }

  if (
    typeof req.query.state !== 'string' ||
    !stateCookie ||
    req.query.state !== stateCookie
  ) {
    return res.status(400).send('Invalid OAuth state. Please try again.');
  }

  if (req.query.error || typeof req.query.code !== 'string') {
    return res.redirect(`${frontendUrl}/login?error=google_login_failed`);
  }

  try {
    const { tokens } = await googleOAuthClient.getToken({
      code: req.query.code,
      redirect_uri: googleCallbackUrl,
    });

    if (!tokens.id_token) {
      throw new Error('Google did not return an ID token');
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const profile = ticket.getPayload();

    if (
      !profile ||
      !profile.sub ||
      !profile.email ||
      profile.email_verified !== true
    ) {
      return res.status(401).send(
        'Google account email could not be verified.'
      );
    }

    const email = profile.email.trim().toLowerCase();

    let result = await pool.query(
      `SELECT id, email, username, role, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    let user = result.rows[0];

    if (!user) {
      const baseUsername =
        (email.split('@')[0]
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .slice(0, 40) || 'student');

      let username = baseUsername;
      let suffix = 1;

      while (true) {
        const usernameCheck = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
        );

        if (usernameCheck.rows.length === 0) break;

        suffix += 1;
        username =
          `${baseUsername.slice(0, 50 - String(suffix).length - 1)}_${suffix}`;
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      result = await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, 'STUDENT')
         RETURNING id, email, username, role, created_at`,
        [username, email, passwordHash]
      );

      user = result.rows[0];
    }

    setAuthCookie(res, user);

    let returnTo = '/';
    if (returnCookie) {
      try {
        const decoded = decodeURIComponent(returnCookie);
        if (
          decoded.startsWith('/') &&
          !decoded.startsWith('//') &&
          !decoded.includes('\\')
        ) {
          returnTo = decoded;
        }
      } catch {
        // Оставляем безопасный адрес по умолчанию.
      }
    }

    return res.redirect(`${frontendUrl}${returnTo}`);
  } catch (err) {
    console.error('GOOGLE AUTH ERROR:', err.message);
    return res.redirect(`${frontendUrl}/login?error=google_login_failed`);
  }
});

function publicUser(user) {
  return {
    id: String(user.id),
    email: user.email,
    username: user.username,
    display_name: user.username,
    full_name: '',
    bio: '',
    avatar_url: '',
    language: 'English',
    created_date: user.created_at,
    role: user.role,
  };
}

async function requireAuth(req, res, next) {
  const token = getTokenFromCookie(req);

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, email, username, role, created_at
       FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    console.error('AUTH ERROR:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (email.length > 100) {
      return res.status(400).json({ error: 'Email is too long' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        error: 'Password is too long',
      });
    }

    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }


    const baseUsername =
      email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40)
      || 'student';

    let username = baseUsername;
    let suffix = 1;

    while (true) {
      const check = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (check.rows.length === 0) break;

      suffix += 1;
      username = `${baseUsername.slice(0, 50 - String(suffix).length - 1)}_${suffix}`;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'STUDENT')
       RETURNING id, email, username, role, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    setAuthCookie(res, user);

    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Email or username is already registered',
      });
    }

    console.error('REGISTER ERROR:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (typeof password !== 'string' || !email) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      `SELECT id, email, username, password_hash, role, created_at
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    setAuthCookie(res, user);

    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json(publicUser(req.user));
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('speaken_token', authCookieClearOptions);
  return res.status(204).end();
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ОШИБКА БАЗЫ ДАННЫХ:', err.message);
  } else {
    console.log('✅ БАЗА ДАННЫХ ПОДКЛЮЧЕНА УСПЕШНО!');
  }
});

app.get('/api/v1/topics', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, category, description FROM topics'
    );

    res.json(result.rows);
  } catch (err) {
    console.error('ОШИБКА В /topics:', err.message);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

app.get('/api/v1/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, category, description FROM topics WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Topic not found'
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('ОШИБКА В /topics/:id:', err.message);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

// Sessions, topic generation, upload, profile edit (see demoRoutes.js)
app.use(require('./demoRoutes')({ pool, requireAuth }));

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'English Learning App API is running',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
