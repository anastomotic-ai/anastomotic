import { useTranslation } from 'react-i18next';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { DebugSection } from '@/components/settings/DebugSection';
import { AutoLearnSection } from '@/components/settings/AutoLearnSection';

interface GeneralTabProps {
  notificationsEnabled: boolean;
  onNotificationsToggle: () => void;
  debugMode: boolean;
  onDebugToggle: () => void;
  autoLearnEnabled: boolean;
  onAutoLearnToggle: () => void;
}

export function GeneralTab({
  notificationsEnabled,
  onNotificationsToggle,
  debugMode,
  onDebugToggle,
  autoLearnEnabled,
  onAutoLearnToggle,
}: GeneralTabProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      <section>
        <NotificationsSection enabled={notificationsEnabled} onToggle={onNotificationsToggle} />
      </section>

      <section>
        <AutoLearnSection enabled={autoLearnEnabled} onToggle={onAutoLearnToggle} />
      </section>

      <section>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {t('developer.title')}
        </h4>
        <DebugSection debugMode={debugMode} onDebugToggle={onDebugToggle} />
      </section>
    </div>
  );
}
