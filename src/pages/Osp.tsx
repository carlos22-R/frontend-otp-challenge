
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation ,useSearchParams} from 'react-router-dom';

const OTP_LENGTH = 4;

function Osp(){
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';
  const [searchParams] = useSearchParams();
const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [active, setActive] = useState(false);
  const otpFromQuery = searchParams.get("otp");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
// Validación inicial para asegurar que el usuario viene del login con un email y OTP válido
  useEffect(() => {
    if (!email || !otpFromQuery || !/^\d{4}$/.test(otpFromQuery)) {
      navigate('/', { state: { error: 'Debe autenticarse primero' } });
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate, otpFromQuery]);
  // Validación del OTP cada vez que cambia el estado de los dígitos o el OTP de la URL
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === OTP_LENGTH && otp.every(d => d !== '')) {
      if (otpString === otpFromQuery) {
        setActive(true);
        setError('');
      } else {
        setActive(false);
        setError('El código ingresado no es correcto');
      }
    } else {
      setActive(false);
      setError('');
    }
  }, [otp, otpFromQuery]);

  // Manejo de cambios en los inputs
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

// Manejo de teclas para navegación entre inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };
// Manejo de pegado para permitir pegar el OTP completo
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (!digits) return;

    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };
// Manejo de envío del formulario para verificar el OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setError('Por favor ingrese el código completo');
      return;
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();

      if (data.valid) {
        navigate('/success', { state: { verified: true } });
      } else {
        setError(data.error || 'El código ingresado no es correcto');
      }
    } catch {
      setError('Error de conexión con el servidor');
    }
  };
// Manejo de reenvío del OTP para solicitar un nuevo código
  const handleResend = async () => {
    try {
      const res = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        // Actualizar el OTP en la URL sin recargar
        const newParams = new URLSearchParams(searchParams);
        newParams.set('otp', data.otp);
        window.history.replaceState({state: { email }}, '', `?${newParams.toString()}`);
        window.location.reload();
      }
    } catch {
      setError('Error al reenviar el código');
    }

    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl mb-2 text-gray-900">Verificación</h1>
            <p className="text-gray-500">
              Ingrese el código de {OTP_LENGTH} dígitos enviado a
            </p>
            <p className="text-gray-900 mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex gap-2 justify-center mb-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    aria-label={`Dígito ${index + 1} de ${OTP_LENGTH}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none transition-colors bg-gray-50 text-gray-900 text-xl"
                  />
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center" role='alert'>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!active}
              aria-disabled={!active}
              className={`w-full py-3 rounded-lg transition-all shadow-lg ${
                active
                  ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              ¿No recibió el código?
            </p>
            <button
              onClick={handleResend}
              className="text-gray-900 hover:underline"
            >
              Reenviar código
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Osp;