import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function OfflinePage() {
  const { t } = useTranslation();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
          {t('offline.title')}
        </h1>
        <p className="text-base text-muted-foreground">
          {t('offline.subtitle')}
        </p>
      </div>
    </div>
  );
}
