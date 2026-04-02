import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Osp from '../Osp';

// Helper para renderizar el componente con la ruta y estado necesarios
function renderOsp(otp = '1234', email = 'test@example.com') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/verify', search: `?otp=${otp}`, state: { email } }]}>
      <Routes>
        <Route path="/verify" element={<Osp />} />
        <Route path="/" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Osp - Verificación OTP', () => {
  it('muestra 4 inputs de dígitos', () => {
    renderOsp();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('el botón está deshabilitado cuando el código está incompleto', () => {
    renderOsp();
    const button = screen.getByRole('button', { name: /continuar/i });
    expect(button).toBeDisabled();
  });

  it('habilita el botón cuando el OTP ingresado coincide con el de la URL', async () => {
    const user = userEvent.setup();
    renderOsp('1234');

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.keyboard('1234');

    const button = screen.getByRole('button', { name: /continuar/i });
    expect(button).toBeEnabled();
  });

  it('muestra error cuando el OTP ingresado no coincide', async () => {
    const user = userEvent.setup();
    renderOsp('1234');

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.keyboard('5678');

    expect(screen.getByRole('alert')).toHaveTextContent('El código ingresado no es correcto');
  });

  it('distribuye dígitos al pegar un código completo', async () => {
    const user = userEvent.setup();
    renderOsp('4567');

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('4567');

    expect(inputs[0]).toHaveValue('4');
    expect(inputs[1]).toHaveValue('5');
    expect(inputs[2]).toHaveValue('6');
    expect(inputs[3]).toHaveValue('7');
  });

  it('sanitiza caracteres no numéricos al pegar', async () => {
    const user = userEvent.setup();
    renderOsp();

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('1a2b');

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
  });

  it('navega al input anterior con ArrowLeft', async () => {
    const user = userEvent.setup();
    renderOsp();

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[1]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[0]).toHaveFocus();
  });

  it('navega al input siguiente con ArrowRight', async () => {
    const user = userEvent.setup();
    renderOsp();

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.keyboard('{ArrowRight}');

    expect(inputs[1]).toHaveFocus();
  });

  it('Backspace en input vacío regresa al anterior', async () => {
    const user = userEvent.setup();
    renderOsp();

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.keyboard('1');
    // Ahora estamos en inputs[1] (avance automático), que está vacío
    await user.keyboard('{Backspace}');

    expect(inputs[0]).toHaveFocus();
  });

  it('redirige al login si la URL no tiene OTP válido', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify', search: '', state: { email: 'test@example.com' } }]}>
        <Routes>
          <Route path="/verify" element={<Osp />} />
          <Route path="/" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
