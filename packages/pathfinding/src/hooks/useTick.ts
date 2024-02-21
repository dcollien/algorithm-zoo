import React from 'react';

export default function useTick(callback: () => void, delay: number): [() => void, () => void]{
  const timeoutRef = React.useRef<number | null>(null);
  const savedCallback = React.useRef(callback);
  
  const tick = () => {
    savedCallback.current();
    timeoutRef.current = window.setTimeout(tick, delay);
  };

  const stop = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  const start = () => {
    stop();
    timeoutRef.current = window.setTimeout(tick, delay);
  }

  React.useEffect(() => {
    start();
  }, [delay]);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    return () => stop();
  }, []);

  return [start, stop];
};
