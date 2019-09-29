import {useState} from 'react';

export function useInstance(initialValue = {}) {
  return useState(initialValue)[0];
}
