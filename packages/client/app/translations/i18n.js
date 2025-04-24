import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { serverUrl } from '@coko/client'

i18next
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    // lng will override the browser detector if provided
    // lng: defaultLanguage,
    // ns: 'translation',
    interpolation: { escapeValue: false },

    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'cookie', 'sessionStorage', 'path', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },

    // Good idea to provide a fallback when loading
    // translations from a back-end, to avoid unsuccessful
    // attempts to load default fallbackLng ("dev").
    fallbackLng: 'en-GB',

    // Back-end config
    backend: {
      loadPath: `${serverUrl}/languages/{{lng}}.json`,
    },
    returnedObjectHandler: (key, object) => {
      const { value } = object
      return value || `No translation value found for key ${key}`
    },
    parseMissingKeyHandler: key => key,
    debug: process.env.NODE_ENV === 'development',
  })

export default i18next

export function languageCodeOnly(fullyQualifiedCode) {
  return fullyQualifiedCode.split('-')[0]
}
