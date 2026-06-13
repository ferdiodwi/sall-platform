import { describe, it, expect } from 'vitest'
import { getRuleBasedFeedback } from '@/lib/feedback-engine'

describe('Feedback Engine Fallback', () => {
  it('should return perfect feedback if there are no wrong answers', () => {
    const feedback = getRuleBasedFeedback([])
    expect(feedback.weakTopic).toBe('none')
    expect(feedback.tipsCount).toBe(0)
    expect(feedback.message).toContain('Sempurna!')
  })

  it('should identify the topic with the most errors', () => {
    const wrongAnswers = [
      { topic: 'fabric_types' },
      { topic: 'fabric_types' },
      { topic: 'vocabulary_general' },
    ]
    const feedback = getRuleBasedFeedback(wrongAnswers)
    expect(feedback.weakTopic).toBe('fabric_types')
    expect(feedback.tipsCount).toBe(2)
    expect(feedback.recommendedActivity).toBe('Fashion Vocabulary Builder — Bab Kain')
    expect(feedback.estTimeMinutes).toBe(7)
  })

  it('should fallback to default topic recommendations if topic is not registered', () => {
    const wrongAnswers = [
      { topic: 'unknown_topic' },
    ]
    const feedback = getRuleBasedFeedback(wrongAnswers)
    expect(feedback.weakTopic).toBe('unknown_topic')
    expect(feedback.tipsCount).toBe(1)
    expect(feedback.recommendedActivity).toBe('Fashion Vocabulary Builder')
    expect(feedback.estTimeMinutes).toBe(7)
  })
})
