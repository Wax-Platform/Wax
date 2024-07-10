import { useEffect } from 'react'

const useDomObserver = config => {
  const {
    selector,
    onMatch,
    enabled,
    options = { childList: true, subtree: true },
  } = config

  useEffect(() => {
    let observer

    if (enabled) {
      observer = new MutationObserver((mutationsList, observerInstance) => {
        mutationsList.some(mutation => {
          if (mutation.type === 'childList') {
            const targetElement = document.querySelector(selector)

            if (targetElement && typeof onMatch === 'function') {
              onMatch(targetElement)
              observerInstance.disconnect()
              return true
            }
          }

          return false
        })
      })

      observer.observe(document.body, options)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])
}

export default useDomObserver
