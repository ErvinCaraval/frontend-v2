import React, { useEffect, useState, useRef } from 'react';

export default function Timer({ seconds = 20, onEnd, onTick }) {
  const [time, setTime] = useState(seconds);
  const intervalRef = useRef();

  useEffect(() => {
    setTime(seconds);
  }, [seconds]);

  useEffect(() => {
    if (time === 0) {
      if (onEnd) onEnd();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [time, onEnd]);

  useEffect(() => {
    if (onTick) onTick(time);
  }, [time, onTick]);

  const getTimerColor = () => {
    if (time <= 3) return 'text-red-300 border-red-400/40';
    if (time <= 6) return 'text-amber-300 border-amber-400/40';
    return 'text-white border-white/20';
  };

  return (
    <div className="text-center">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 font-extrabold ${getTimerColor()}`}>
        {time}
      </div>
      <span className="mt-1 block text-xs text-white/70">segundos restantes</span>
    </div>
  );
}