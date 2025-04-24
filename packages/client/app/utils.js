import { useEffect, useRef } from 'react'

/* eslint-disable import/prefer-default-export */
export const usePrevious = value => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
