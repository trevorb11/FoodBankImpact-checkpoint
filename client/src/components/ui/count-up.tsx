import { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  separator?: string;
}

export const CountUp = ({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  separator = ','
}: CountUpProps) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const countStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * (end - start) + start);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(countStep);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = requestAnimationFrame(countStep);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [start, end, duration]);
  
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });
  };
  
  return <span className="animate-count">{formatNumber(count)}</span>;
};
