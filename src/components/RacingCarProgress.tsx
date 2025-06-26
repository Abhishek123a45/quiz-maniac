
import { Car } from "lucide-react";

interface RacingCarProgressProps {
  progress: number; // 0-100
  currentQuestion: number;
  totalQuestions: number;
}

export const RacingCarProgress = ({ progress, currentQuestion, totalQuestions }: RacingCarProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-sm text-gray-500">
          Progress: {Math.round(progress)}%
        </span>
      </div>
      
      {/* Racing track */}
      <div className="relative w-full h-8 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full shadow-inner overflow-hidden">
        {/* Track lines */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-0.5 bg-white opacity-50"></div>
        </div>
        
        {/* Dashed center line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px border-t-2 border-dashed border-yellow-300 opacity-60"></div>
        </div>
        
        {/* Progress fill with gradient */}
        <div 
          className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Racing stripes */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
        
        {/* Racing car */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ left: `calc(${progress}% - 12px)` }}
        >
          <div className="relative">
          <img src="/sportscar.gif" alt="Racing Car" className="w-16 h-16 object-contain drop-shadow-lg" />
            {/* Car exhaust effect */}
            {progress > 0 && (
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-1 bg-gray-400 rounded-full opacity-60 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Finish line */}
        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-black via-white to-black"></div>
        <div className="absolute right-1 top-0 h-full w-1 bg-gradient-to-b from-white via-black to-white"></div>
      </div>
      
      {/* Speed indicator */}
      <div className="flex justify-center mt-2">
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>🏁</span>
          <span>Speed: {Math.round(progress * 2)}%</span>
          <span>🏁</span>
        </div>
      </div>
    </div>
  );
};
