import React, { useEffect } from 'react';
import { useDraggableDialog } from '@/hooks/useDraggableDialog';
import './AboutDialog.scss';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// No need for observer as this component doesn't use MobX state
// eslint-disable-next-line mobx/missing-observer
const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const { dialogRef, position, handlePointerDown, setPosition } = useDraggableDialog({
    shouldStartDrag: (event) => {
      // Only start dragging if clicking on the title bar
      return (event.target as HTMLElement).classList.contains('about-dialog-header');
    }
  });

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Center the dialog on first open
      const rect = dialogRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, [isOpen, dialogRef, setPosition]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="about-dialog-overlay" onClick={onClose} />
      <div
        className="about-dialog"
        ref={dialogRef as React.RefObject<HTMLDivElement>}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="about-dialog-header">
          <h2>About New Domkol</h2>
          <button className="about-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="about-dialog-content">
          <p>
            This application is a demonstration of using Claude Code to upgrade a legacy application to a modern tech stack.
          </p>
          <p>
            The original Domkol is a Javascript application deployed at{' '}
            <a href="https://www.thinkinghard.com/domkol/main" target="_blank" rel="noopener noreferrer">
              https://www.thinkinghard.com/domkol/main
            </a>.
          </p>
          <p>
            It was implemented using a home-made model-view framework based on JQuery, with JQuery events triggering view re-renders from model attribute changes.
          </p>
          <p>
            The new Domkol is based on a tech stack of Typescript, MobX and functional React components.
          </p>
          <p>
            The migration was mostly vibe-coded – I have hardly looked at the new code. (But once the initial upgrade has been completed, I will actually look at the code so I can have some opinions on how good it is and tidy it up if need be.)
          </p>
          <p>
            The one time I had to look at the code was when there was a performance issue that turned out to be caused by accessing proxied MobX attributes inside a per-pixel rendering loop – an issue that was easy to fix once it was understood what was causing it.
          </p>
          <p>
            Source:{' '}
            <a href="https://github.com/pdorrell/domkol" target="_blank" rel="noopener noreferrer">
              https://github.com/pdorrell/domkol
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export { AboutDialog };
