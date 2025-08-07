import React from 'react';
import './VersionDisplay.css';

// No need for observer as this component doesn't use MobX state
// eslint-disable-next-line mobx/missing-observer
const VersionDisplay: React.FC = () => {
  // Version is already set in vite.config.ts with the + suffix for dev mode
  const version = `v${(process.env.APP_VERSION || '-')}`;

  return (
    <div className="version-display">
      {version}
    </div>
  );
};

export default VersionDisplay;
