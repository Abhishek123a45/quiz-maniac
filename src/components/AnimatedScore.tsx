
import { useState, useEffect } from 'react';

interface AnimatedScoreProps {
  score: number;
  duration?: number;
  className?: string;
}

export const AnimatedScore = ({ score, duration = 1000, className = "" }: AnimatedScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === 0) {
      setDisplayScore(0);
      return;
    }

    const startTime = Date.now();
    const startScore = displayScore;
    const scoreChange = score - startScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentScore = Math.round(startScore + scoreChange * easeOutQuart);
      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, duration]);

  return (
    <span className={`font-bold transition-colors duration-300 ${
      displayScore > 0 ? 'text-green-600' : displayScore < 0 ? 'text-red-600' : 'text-gray-600'
    } ${className}`}>
      {displayScore > 0 ? '+' : ''}{displayScore}
    </span>
  );
};
