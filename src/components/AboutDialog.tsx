import React, { useState, useRef, useEffect } from 'react';
import './AboutDialog.css';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// No need for observer as this component doesn't use MobX state
// eslint-disable-next-line mobx/missing-observer
const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Center the dialog on first open
      const rect = dialogRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the title bar
    if ((e.target as HTMLElement).classList.contains('about-dialog-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <>
      <div className="about-dialog-overlay" onClick={onClose} />
      <div
        className="about-dialog"
        ref={dialogRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseDown={handleMouseDown}
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

export default AboutDialog;
