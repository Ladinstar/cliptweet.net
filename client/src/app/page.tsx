import HomeView from '@/views/HomeView';
import { buildHomeJsonLd } from '@/lib/jsonLd';

// Root entry: stays on "/" and shows the browser-detected language (handled client-side
// by i18n). Picking a language in the switcher navigates to the prefixed route (/fr, /es…).
export default function RootHomePage() {
  return (
    <>
      {buildHomeJsonLd('en', '/').map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <HomeView />
    </>
  );
}
