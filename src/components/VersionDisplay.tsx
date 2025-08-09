import React, { useState } from 'react';
import { AboutDialog } from './AboutDialog';
import './VersionDisplay.css';

// No need for observer as this component doesn't use MobX state
// eslint-disable-next-line mobx/missing-observer
const VersionDisplay: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);
  // Version is already set in vite.config.ts with the + suffix for dev mode
  const version = `v${(process.env.APP_VERSION || '-')}`;

  return (
    <>
      <div className="version-display">
        <span className="version-text">{version}</span>
        <button
          className="info-button"
          onClick={() => setShowAbout(true)}
          title="About New Domkol"
        >
          ℹ️
        </button>
      </div>
      <AboutDialog
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
    </>
  );
};

export { VersionDisplay };
