import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AIQuestionGenerator from '../components/AIQuestionGenerator'

describe('AIQuestionGenerator (mobile-friendly cantidad)', () => {
  it('starts with empty cantidad and accepts only numbers', () => {
    const onGenerated = vi.fn()
    const onClose = vi.fn()
    render(<AIQuestionGenerator onQuestionsGenerated={onGenerated} onClose={onClose} />)
    // Abrir flujo IA
    fireEvent.click(screen.getByText('Crear con IA'))
    const input = screen.getByLabelText('Cantidad', { selector: 'input' }) || screen.getByPlaceholderText('Cantidad')
    expect(input.value).toBe('')
    // Escribir letras + números, debe filtrar letras
    fireEvent.change(input, { target: { value: 'a1b2' } })
    expect(input.value).toBe('12')
    // Vaciar deja el campo sin valor válido
    fireEvent.change(input, { target: { value: '' } })
    expect(input.value).toBe('')
  })
})

