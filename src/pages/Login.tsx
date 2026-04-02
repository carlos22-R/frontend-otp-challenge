import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
function Login(){
    const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

     const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor ingrese su correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    setError('');
    setLoading(true);
// Enviar solicitud al backend para generar y enviar el OTP
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Error al enviar el código');
        return;
      }

      navigate(`/verify?otp=${data.otp}`, { state: { email } });
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };
  // Mostrar notificación de error si se redirige con un mensaje de error en el estado
  useEffect(() => {
    if(location.state?.error){
      setToast(location.state.error);
      window.history.replaceState({}, '');
      const timer = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);
    return(
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="ml-2 hover:opacity-75" aria-label="Cerrar notificación">✕</button>
        </div>
      )}
      <div className="w-full max-w-md">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl mb-2 text-gray-900">Bienvenido</h1>
            <p className="text-gray-500">
              Ingrese su correo electrónico para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none transition-colors bg-gray-50 text-gray-900 placeholder:text-gray-400"
              />
              {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Continuar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400" role="note">
              Al continuar, acepta nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Login