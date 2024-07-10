import { useState, useEffect, useRef } from 'react'

const usePrintArea = ({ beforePrint, afterPrint }) => {
  const refElement = useRef(null)

  const [isPrinting, toggleStatus] = useState(false)

  const printMq =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('print')

  let root

  const defaultBeforePrint = () => {
    if (refElement.current) {
      // eslint-disable-next-line no-underscore-dangle
      root = [...document.body.children].find(elem => elem._reactRootContainer)
      root.style.display = 'none'

      const divTemp = document.createElement('div')
      divTemp.id = 'div-Temp'
      divTemp.innerHTML = refElement.current.getContent()
      divTemp.classList.add('ProseMirror')
      document.body.appendChild(divTemp)
    }
  }

  const defaultAfterPrint = () => {
    document.getElementById('div-Temp').remove()
    root.style.display = ''
  }

  useEffect(() => {
    const printFn = mql => {
      toggleStatus(!!mql.matches)

      if (mql.matches) {
        beforePrint ? beforePrint() : defaultBeforePrint()
      } else {
        afterPrint ? afterPrint() : defaultAfterPrint()
      }
    }

    printMq.addListener(printFn)

    return () => printMq.removeEventListener('printEvent', printFn)
  }, [])

  return { refElement, isPrinting }
}

export default usePrintArea
