

import React, { useEffect, useRef, useState } from 'react';
import styles from './confetti.module.css';

interface ConfettiProps {
  show: boolean;
  onAnimationComplete: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ show, onAnimationComplete }) => {
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && confettiRef.current) {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];
      const numConfetti = 100;
      const container = confettiRef.current;

      for (let i = 0; i < numConfetti; i++) {
        const confettiPiece = document.createElement('div');
        // Safely access className from styles
        if (styles.confettiPiece) {
          confettiPiece.className = styles.confettiPiece;
        } else {
          console.warn("CSS module 'confettiPiece' not found in styles.");
          // Fallback or error handling for missing class name
        }
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.left = `${Math.random() * 100}%`;
        confettiPiece.style.animationDuration = `${Math.random() * 2 + 3}s`; // 3-5 seconds
        confettiPiece.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confettiPiece);
      }

      const totalAnimationDuration = 5500; // slightly longer than max confetti animation

      const timeoutId = setTimeout(() => {
        onAnimationComplete();
        if (container) {
          container.innerHTML = ''; // Clean up confetti pieces
        }
      }, totalAnimationDuration);

      return () => {
        clearTimeout(timeoutId);
        if (container) {
          container.innerHTML = ''; // Clean up on unmount or if show changes to false
        }
      };
    }
  }, [show, onAnimationComplete, styles]);

  if (!show) {
    return null;
  }

  return <div ref={confettiRef} className={styles.confettiContainer || ''} />;
};

export default Confetti;

