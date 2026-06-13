import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import QuizEngine from '@/components/student/QuizEngine'
import { QuizQuestion } from '@/types/app'

describe('QuizEngine Component', () => {
  const dummyQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quiz_id: 'quiz-1',
      type: 'vocab',
      prompt: 'What tool is used for cutting fabric?',
      passage: null,
      options: ['Sewing Machine', 'Shears / Scissors', 'Tape Measure', 'Thimble'],
      topic: 'fabric_tools',
      order: 1,
    },
    {
      id: 'q2',
      quiz_id: 'quiz-1',
      type: 'reading',
      prompt: 'According to the text, which fiber is natural?',
      passage: 'Cotton is a natural fiber harvested from cotton plants.',
      options: ['Polyester', 'Nylon', 'Cotton', 'Acrylic'],
      topic: 'fabric_types',
      order: 2,
    },
  ]

  it('should render message if questions array is empty', () => {
    render(<QuizEngine questions={[]} onComplete={vi.fn()} />)
    expect(screen.getByText('Kuis tidak memiliki pertanyaan yang valid.')).toBeInTheDocument()
  })

  it('should render first question options and progress correctly', () => {
    render(<QuizEngine questions={dummyQuestions} onComplete={vi.fn()} />)
    expect(screen.getByText('What tool is used for cutting fabric?')).toBeInTheDocument()
    expect(screen.getByText('Shears / Scissors')).toBeInTheDocument()
    expect(screen.getByText('Soal 1 dari 2')).toBeInTheDocument()
  })

  it('should enable Lanjut button only when option is selected', () => {
    render(<QuizEngine questions={dummyQuestions} onComplete={vi.fn()} />)
    const nextButton = screen.getByRole('button', { name: /Lanjut/i })
    expect(nextButton).toBeDisabled()

    const optionB = screen.getByText('Shears / Scissors')
    fireEvent.click(optionB)

    expect(nextButton).toBeEnabled()
  })

  it('should render passage on reading comprehension questions', () => {
    render(<QuizEngine questions={dummyQuestions} onComplete={vi.fn()} />)
    // Go to next question
    fireEvent.click(screen.getByText('Shears / Scissors'))
    fireEvent.click(screen.getByRole('button', { name: /Lanjut/i }))

    expect(screen.getByText('According to the text, which fiber is natural?')).toBeInTheDocument()
    expect(screen.getByText('Cotton is a natural fiber harvested from cotton plants.')).toBeInTheDocument()
  })

  it('should trigger onComplete callback with all answer payloads on submit', () => {
    const onCompleteMock = vi.fn()
    render(<QuizEngine questions={dummyQuestions} onComplete={onCompleteMock} />)

    // Answer Q1
    fireEvent.click(screen.getByText('Shears / Scissors'))
    fireEvent.click(screen.getByRole('button', { name: /Lanjut/i }))

    // Answer Q2
    fireEvent.click(screen.getByText('Cotton'))
    fireEvent.click(screen.getByRole('button', { name: /Kirim Jawaban/i }))

    expect(onCompleteMock).toHaveBeenCalledTimes(1)
    expect(onCompleteMock).toHaveBeenCalledWith([
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 2 },
    ])
  })
})
