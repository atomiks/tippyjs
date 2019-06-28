import { useState } from 'react'

export function useThis(initialValue = {}) {
  return useState(initialValue)[0]
}
