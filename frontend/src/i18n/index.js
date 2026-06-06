// import i18n from 'i18next'
// import { initReactI18next } from 'react-i18next'
// import en from './locales/en.json'
// import ur from './locales/ur.json'

// const savedLang = localStorage.getItem('language') || 'en'

// i18n
//   .use(initReactI18next)
//   .init({
//     resources: {
//       en: { translation: en },
//       ur: { translation: ur }
//     },
//     lng: savedLang,
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false
//     }
//   })

// export default i18n


import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ur from './locales/ur.json'

// ─── Apply language direction + font ─────────────────────────────────────────
export const applyDirection = (lng) => {
  const isUrdu = lng === 'ur'

  // RTL / LTR
  document.documentElement.dir  = isUrdu ? 'rtl' : 'ltr'
  document.documentElement.lang = lng

  // CSS variable for body font
  document.documentElement.style.setProperty(
    '--B',
    isUrdu
      ? "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif"
      : "'Outfit', system-ui, sans-serif"
  )

  // Load Urdu font on demand
  if (isUrdu && !document.querySelector('#urdu-font')) {
    const l = document.createElement('link')
    l.id   = 'urdu-font'
    l.rel  = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap'
    document.head.appendChild(l)
  }

  // Urdu line-height fix (Nastaliq needs more breathing room)
  document.body.style.lineHeight = isUrdu ? '2.2' : ''
}

// ─── Init ─────────────────────────────────────────────────────────────────────
const savedLang = 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng:          savedLang,
    fallbackLng:  'en',
    interpolation: { escapeValue: false },
    returnObjects: true,
  })

// Apply on boot
applyDirection(savedLang)

// Apply on every language change + persist
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('kisanai-lang', lng)
  applyDirection(lng)
})

export default i18n