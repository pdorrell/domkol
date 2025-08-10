import React from 'react';
import { observer } from 'mobx-react-lite';
import { AboutDialog } from './AboutDialog';
import { ValueModel } from '@/utils/value-model';
import './AppInfoDisplay.scss';

interface AppInfoDisplayProps {
  showAbout: ValueModel<boolean>;
}

const AppInfoDisplay: React.FC<AppInfoDisplayProps> = observer(({ showAbout }) => {
  // Version is already set in vite.config.ts with the + suffix for dev mode
  const version = `v${(process.env.APP_VERSION || '-')}`;

  return (
    <>
      <div className="app-info-display">
        <span className="version-text">{version}</span>
        <button
          className="info-button"
          onClick={() => showAbout.set(true)}
          title="About New Domkol"
        >
          ℹ️
        </button>
      </div>
      <AboutDialog
        isOpen={showAbout.value}
        onClose={() => showAbout.set(false)}
      />
    </>
  );
});

export { AppInfoDisplay };
