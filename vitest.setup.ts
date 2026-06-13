import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock DOMPurify as it doesn't run natively in node without jsdom configurations
vi.mock('dompurify', () => ({
  default: {
    sanitize: (val: string) => val,
  },
}))
