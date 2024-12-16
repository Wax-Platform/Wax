export const loadScript = (scrollPos, iframe) => {
  const scopeIsReady = document.getElementById('css-assistant-scope')
  try {
    scopeIsReady && PagedPolyfill.preview(scopeIsReady)
  } catch (e) {
    iframe.parent.console.log(e)
  }

  setTimeout(() => document.documentElement.scrollTo(0, scrollPos), 200)

  document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop < 10) {
      document.documentElement.scrollTo(0, 10)
    }
  })
}

export const nodeSelection = window => event => {
  const { target } = event
  if (!target.hasAttribute('data-aidctx')) event.preventDefault()
  let aidctx =
    event.target.getAttribute('data-aidctx') ||
    event.target.parentElement.getAttribute('data-aidctx')
  if (
    event.target.contains(
      document.documentElement.querySelector('.pagedjs_page_content'),
    )
  ) {
    aidctx = 'aid-ctx-main'
  }
  if (aidctx) {
    window.parent.console.log('fromiframe', aidctx)
    document.documentElement
      .querySelector('.selected-aidctx')
      ?.classList.remove('selected-aidctx')
    aidctx !== 'aid-ctx-main' &&
      document.documentElement
        .querySelector('[data-aidctx="' + aidctx + '"]')
        .classList.add('selected-aidctx')
    window.parent.postMessage({ aidctx }, '*')
  }
}
