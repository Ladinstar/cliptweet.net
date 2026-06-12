import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import de from '@/locales/de.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import nl from '@/locales/nl.json';
import pl from '@/locales/pl.json';
import ar from '@/locales/ar.json';
import { applyBrand, brandHomeSections } from '@/lib/messages';

// Brand text overrides (locales' `brands.<id>` section) are merged over each
// locale so the white-label build swaps its copy without touching components.
// `translation` holds the site-wide overrides; `brandHome` additionally holds
// the page-scoped copy (hero, intro, steps, FAQ) used by the focused home only.
const locales = { en, fr, es, de, it, pt, nl, pl, ar };
const resources = Object.fromEntries(
  Object.entries(locales).map(([lng, messages]) => [
    lng,
    { translation: applyBrand(messages), brandHome: brandHomeSections(messages) },
  ]),
);

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      defaultNS: 'translation',
      fallbackLng: 'en',
      supportedLngs: ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'ar'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupQuerystring: 'lng',
      },
    });
}

export default i18n;
