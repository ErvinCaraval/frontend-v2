import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

describe('LoginPage', () => {
  it('renderiza el formulario de login', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
  const email = screen.getByPlaceholderText(/correo|email|correo electrónico/i)
  const password = screen.getByPlaceholderText(/contraseña|password/i)
  const submit = screen.getByRole('button', { name: /iniciar sesión|iniciar sesión|login|submit/i })

    expect(email).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })
})
