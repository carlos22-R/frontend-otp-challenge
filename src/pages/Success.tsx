import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = (location.state as { verified?: boolean })?.verified;

  useEffect(() => {
    if (!verified) {
      navigate('/', { state: { error: 'Debe autenticarse primero' } });
    }
  }, [verified, navigate]);

  if (!verified) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">¡Verificación exitosa!</h1>
          <p className="text-gray-500 mb-8">
            Su identidad ha sido verificada correctamente
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-3 rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}