import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Pruebas Unitarias: Módulo de Autenticación', () => {
    test('Alternancia de visibilidad de contraseña (toggle)', () => {
        const input = { type: 'password' };
        const btn = { textContent: '👁️' };

        function toggle(inputObj, btnObj) {
            if (inputObj.type === 'password') {
                inputObj.type = 'text';
                btnObj.textContent = '🙈';
            } else {
                inputObj.type = 'password';
                btnObj.textContent = '👁️';
            }
        }

        toggle(input, btn);
        assert.equal(input.type, 'text');
        assert.equal(btn.textContent, '🙈');

        toggle(input, btn);
        assert.equal(input.type, 'password');
        assert.equal(btn.textContent, '👁️');
    });

    test('Validación de contraseñas coincidentes y longitud mínima', () => {
        function validateNewPassword(pass1, pass2) {
            if (!pass1 || pass1.length < 6) return 'La contraseña debe contener al menos 6 caracteres.';
            if (pass1 !== pass2) return 'Las contraseñas no coinciden.';
            return null;
        }

        assert.equal(validateNewPassword('123', '123'), 'La contraseña debe contener al menos 6 caracteres.');
        assert.equal(validateNewPassword('123456', '123457'), 'Las contraseñas no coinciden.');
        assert.equal(validateNewPassword('secreto123', 'secreto123'), null);
    });

    test('Mapeo de errores de login amigables', () => {
        function mapLoginError(err) {
            const errStr = (err?.message || '').toLowerCase();
            if (errStr.includes('invalid login') || errStr.includes('invalid credentials')) {
                return 'Email o contraseña incorrectos. Verificá que no haya mayúsculas o espacios de más.';
            }
            if (errStr.includes('email not confirmed')) {
                return 'Tu email aún no está confirmado. Por favor revisá tu bandeja de entrada o spam para confirmar la cuenta.';
            }
            return 'No se pudo iniciar sesión. Verificá tu email y contraseña.';
        }

        assert.ok(mapLoginError({ message: 'Invalid login credentials' }).includes('Email o contraseña incorrectos'));
        assert.ok(mapLoginError({ message: 'Email not confirmed' }).includes('Tu email aún no está confirmado'));
        assert.ok(mapLoginError(null).includes('No se pudo iniciar sesión'));
    });
});
