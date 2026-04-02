import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Almacén temporal de OTPs en memoria (en producción usarías Redis o BD)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Genera OTP de 4 dígitos
function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// POST /api/send-otp  →  genera y "envía" el OTP
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email es requerido' });
    return;
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

  otpStore.set(email, { otp, expiresAt });

  // En producción enviarías el OTP por email (SendGrid, Resend, etc.)
  // Para demo, lo devolvemos en la respuesta y lo mostramos en consola
  console.log(`[OTP] ${email} → ${otp}`);

  res.json({ success: true, otp });
});

// POST /api/verify-otp  →  valida el OTP ingresado
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: 'Email y OTP son requeridos' });
    return;
  }

  const stored = otpStore.get(email);

  if (!stored) {
    res.status(400).json({ valid: false, error: 'No se encontró un OTP para este email' });
    return;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    res.status(400).json({ valid: false, error: 'El código ha expirado' });
    return;
  }

  if (stored.otp !== otp) {
    res.json({ valid: false, error: 'El código ingresado no es correcto' });
    return;
  }

  otpStore.delete(email);
  res.json({ valid: true });
});

// POST /api/resend-otp  →  regenera el OTP
app.post('/api/resend-otp', (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email es requerido' });
    return;
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore.set(email, { otp, expiresAt });

  console.log(`[OTP resend] ${email} → ${otp}`);

  res.json({ success: true, otp });
});

app.listen(PORT, () => {
  console.log(`Servidor OTP corriendo en http://localhost:${PORT}`);
});
