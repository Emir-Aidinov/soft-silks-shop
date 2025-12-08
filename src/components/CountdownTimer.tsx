import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate: string;
  title?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ endDate, title }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired || !timeLeft) {
    return null;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-background/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px]">
        <span className="text-xl md:text-2xl font-bold tabular-nums">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs mt-1 opacity-80">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {title && (
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          <span>{title}</span>
        </div>
      )}
      <div className="flex items-center gap-1 md:gap-2">
        {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="дн" />}
        <TimeBlock value={timeLeft.hours} label="ч" />
        <span className="text-xl font-bold opacity-50">:</span>
        <TimeBlock value={timeLeft.minutes} label="мин" />
        <span className="text-xl font-bold opacity-50">:</span>
        <TimeBlock value={timeLeft.seconds} label="сек" />
      </div>
    </div>
  );
};
