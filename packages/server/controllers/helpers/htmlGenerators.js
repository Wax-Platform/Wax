const { isEmpty } = require('lodash')
const cheerio = require('cheerio')
const config = require('config')

const paginationExtractor = pagination => {
  const both = pagination.left && pagination.right

  if (both) {
    return 'start-left start-right'
  }

  if (pagination.left) {
    return 'start-left'
  }

  if (pagination.right) {
    return 'start-right'
  }

  return ''
}

const featureBookStructureEnabled =
  config.has('featureBookStructure') &&
  ((config.get('featureBookStructure') &&
    JSON.parse(config.get('featureBookStructure'))) ||
    false)

const featurePODEnabled =
  config.has('featurePOD') &&
  ((config.get('featurePOD') && JSON.parse(config.get('featurePOD'))) || false)

const runningHeadersGenerator = (runningHeadersLeft, runningHeadersRight) => {
  if (!featureBookStructureEnabled) {
    return `<div class="running-left">${runningHeadersLeft || '&#xA0;'}</div>
        <div class="running-right">${runningHeadersRight || '&#xA0;'}</div>`
  }

  return ''
}

const generateContainer = (
  bookComponent,
  firstInBody = false,
  level = undefined,
) => {
  const {
    id,
    title,
    componentType,
    runningHeadersLeft,
    runningHeadersRight,
    pagination,
    division,
    // number,
    includeInTOC,
  } = bookComponent

  let output
  const levelClass = level ? `level-${level}` : undefined

  if (componentType === 'toc') {
    output = cheerio.load(
      `<section id="comp-number-${id}" class="component-${division} ${componentType} ${
        !featureBookStructureEnabled ? paginationExtractor(pagination) : ''
      }">${runningHeadersGenerator(
        runningHeadersLeft,
        runningHeadersRight,
      )}<header><h1 class="component-title">${title}</h1></header><nav>
      <ol id="toc-ol"></ol></nav></section>`,
    )
  } else if (componentType === 'endnotes') {
    output = cheerio.load(
      `<section id="comp-number-${id}" class="$component-${division} ${componentType} ${
        !featureBookStructureEnabled ? paginationExtractor(pagination) : ''
      }">${runningHeadersGenerator(runningHeadersLeft, runningHeadersRight)}
      <header><h1 class="component-title">${title}</h1></header></section>`,
    )
  } else {
    // let componentNumber

    // if (componentType === 'chapter' || componentType === 'part') {
    //   componentNumber = `<span class="${componentType}-number">${number}</span>`
    // }

    output = cheerio.load(
      `<section id="comp-number-${id}" class="component-${division} ${
        levelClass || ''
      } ${componentType} ${
        !featureBookStructureEnabled ? paginationExtractor(pagination) : ''
      } ${!includeInTOC ? 'toc-ignore' : ''}">${
        firstInBody ? '<span class="restart-numbering"></span>' : ''
      }${runningHeadersGenerator(
        runningHeadersLeft,
        runningHeadersRight,
      )}</section>`, // <header>${componentNumber || ''}</header>
    )
  }

  return output('body').html()
}

const generatePagedjsContainer = bookTitle => {
  const output = cheerio.load(
    `<!DOCTYPE html><html><head><title>${bookTitle}</title>
    <meta charset="UTF-8"></head><body class="hyphenate" lang="en-us"></body></html>`,
  )

  return output.html()
}

const generateTitlePage = (
  bookComponent,
  bookTitle,
  authors,
  subtitle = undefined,
) => {
  const {
    id,
    componentType,
    division,
    pagination,
    runningHeadersLeft,
    runningHeadersRight,
  } = bookComponent

  const output = cheerio.load(
    `<section id="comp-number-${id}" class="component-${division} ${componentType} ${
      !featurePODEnabled ? paginationExtractor(pagination) : ''
    }">${runningHeadersGenerator(
      runningHeadersLeft,
      runningHeadersRight,
    )}<header>
        ${
          bookTitle
            ? `<h1 id="${id}" class="component-title">${bookTitle}</h1>`
            : 'Untitled'
        }
        </header>
        ${subtitle ? `<h2 class="book-subtitle">${subtitle}</h2>` : ''}
        ${
          authors && authors.length > 0
            ? `<h2 class="book-authors">${authors.toString()}</h2>`
            : ''
        }
    </section>`,
  )

  return output('body').html()
}

const generateCopyrightsPage = (bookTitle, bookComponent, podMetadata) => {
  const {
    id,
    componentType,
    division,
    pagination,
    // runningHeadersLeft,
    // runningHeadersRight,
    // title,
  } = bookComponent

  const {
    copyrightLicense,
    licenseTypes,
    publicDomainType,
    isbns,
    topPage,
    bottomPage,
    ncCopyrightHolder,
    ncCopyrightYear,
    saCopyrightHolder,
    saCopyrightYear,
  } = podMetadata

  let year

  if (copyrightLicense === 'SCL') {
    year = ncCopyrightYear ? new Date(ncCopyrightYear).getFullYear() : undefined
  }

  if (copyrightLicense === 'CC') {
    year = saCopyrightYear ? new Date(saCopyrightYear).getFullYear() : undefined
  }

  const pdContent =
    publicDomainType === 'cc0'
      ? 'This  is marked with CC0 1.0 Universal.'
      : 'This work is licensed under the Creative Commons Public Domain Mark 1.0 License.'

  let copyrightText

  if (copyrightLicense === 'SCL') {
    copyrightText = `${
      bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
    }<span class="copyrights-symbol"> © </span>${
      year ? `<span class="copyrights-year">${year} </span>` : ''
    }${
      ncCopyrightHolder
        ? `<span class="copyrights-holder">by ${ncCopyrightHolder}</span>`
        : ''
    }. All rights reserved. Except as permitted under the United States Copyright Act of 1976, no part of this publication may be reproduced or distributed in any form or by any means, or stored in a database or other retrieval system, without the prior written permission of the copyright holder.`
  }

  if (copyrightLicense === 'CC') {
    if (licenseTypes) {
      if (licenseTypes.ND && !licenseTypes.SA && !licenseTypes.NC) {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution-NoDerivatives 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nd/4.0/`
      } else if (licenseTypes.NC && !licenseTypes.SA && !licenseTypes.ND) {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc/4.0/`
      } else if (licenseTypes.SA && !licenseTypes.NC && !licenseTypes.ND) {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/`
      } else if (licenseTypes.NC && licenseTypes.ND) {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution-NonCommercial-NoDerivatives 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-nd/4.0/`
      } else if (licenseTypes.NC && licenseTypes.SA) {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/`
      } else {
        copyrightText = `${
          bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
        }<span class="copyrights-symbol"> © </span>${
          year ? `<span class="copyrights-year">${year} </span>` : ''
        }${
          saCopyrightHolder
            ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
            : ''
        } is licensed under Attribution 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by/4.0/`
      }
    } else {
      copyrightText = `${
        bookTitle ? `<span class="book-title">${bookTitle}</span>` : ''
      }<span class="copyrights-symbol"> © </span>${
        year ? `<span class="copyrights-year">${year} </span>` : ''
      }${
        saCopyrightHolder
          ? `<span class="copyrights-holder">by ${saCopyrightHolder}</span>`
          : ''
      } is licensed under Attribution 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by/4.0/`
    }
  }

  if (copyrightLicense === 'PD') {
    copyrightText = pdContent
  }

  if (!copyrightText) {
    copyrightText = `THIS IS A PLACEHOLDER. IF YOU WANT TO HAVE AN ACTUAL STATEMENT HERE, YOU HAVE TO MAKE SOME CHOICES USING BOOK'S METADATA MODAL.`
  }

  // const output = cheerio.load(
  //   `<section id="comp-number-${id}"  class="component-${division} ${componentType} ${
  //     !featurePODEnabled ? paginationExtractor(pagination) : ''
  //   }">${runningHeadersGenerator(
  //     runningHeadersLeft,
  //     runningHeadersRight,
  //   )}<header><h1 class="component-title">${title}</h1></header>
  //   ${topPage ? `<section class="copyright-before">${topPage}</section>` : ''}
  //   ${
  //     copyrightText
  //       ? `<section class="book-copyrights">${
  //           isbn ? `<p class="isbn">${isbn}</p>` : ''
  //         }<p class="main-content">${copyrightText}</p></section>`
  //       : ''
  //   }
  //   ${
  //     bottomPage
  //       ? `<section class="copyright-after">${bottomPage}</section>`
  //       : ''
  //   }

  //   </section>`,
  // )

  // If there is copyright text, it should include all isbns
  let isbnText

  if (copyrightText && !isEmpty(isbns)) {
    isbnText = isbns
      .map(
        item =>
          '<p class="isbn-item">' +
          `<span class="isbn-label">${item.label}</span>` +
          `<span class="isbn-number"> ${item.isbn} </span>` +
          '</p>',
      )
      .join('')
  } else {
    isbnText = ''
  }

  const output = cheerio.load(
    `<section id="comp-number-${id}"  class="component-${division} ${componentType} ${
      !featurePODEnabled ? paginationExtractor(pagination) : ''
    }">
    ${topPage ? `<section class="copyright-before">${topPage}</section>` : ''}
    ${
      copyrightText
        ? `<section class="book-copyrights">${
            isbnText ? `<div class="isbns">${isbnText}</div>` : ''
          }<p class="main-content">${copyrightText}</p></section>`
        : ''
    }
    ${
      bottomPage
        ? `<section class="copyright-after">${bottomPage}</section>`
        : ''
    }

    </section>`,
  )

  return output.html()
}

const generateCopyrightsContentForWeb = (
  bookTitle,
  bookComponent,
  podMetadata,
) => {
  const copyrightPage = generateCopyrightsPage(
    bookTitle,
    bookComponent,
    podMetadata,
  )

  let copyrightContent = copyrightPage.substring(
    copyrightPage.indexOf('<body>') + 6,
    copyrightPage.indexOf('</body>'),
  )

  const startCcLink = copyrightContent.indexOf('https://creativecommons.org')

  if (startCcLink) {
    const endCcLink = copyrightContent.indexOf('<', startCcLink)
    const ccLink = copyrightContent.substring(startCcLink, endCcLink)

    copyrightContent = copyrightContent.replace(
      ccLink,
      `<a href="${ccLink}" target="_blank" rel="noopener noreferrer">${ccLink}</a>`,
    )
  }

  return copyrightContent
}

module.exports = {
  generatePagedjsContainer,
  generateContainer,
  generateTitlePage,
  generateCopyrightsPage,
  generateCopyrightsContentForWeb,
}
