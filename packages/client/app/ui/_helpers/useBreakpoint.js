import { useState, useEffect } from 'react'

const useBreakpoint = mediaQuery => {
  const mediaQueryList = window.matchMedia(mediaQuery)
  const [isMobile, setIsMobile] = useState(mediaQueryList.matches)

  const matches = e => {
    if (e.matches) {
      setIsMobile(true)
    } else {
      setIsMobile(false)
    }
  }

  useEffect(() => {
    mediaQueryList.addEventListener('change', matches)

    return () => mediaQueryList.removeEventListener('change', matches)
  }, [])

  return isMobile
}

export default useBreakpoint
