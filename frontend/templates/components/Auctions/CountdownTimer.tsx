import { useEffect, useState } from "react";
import { formatCountdown } from "../../utils/formatTime";

interface Props {
  endTime: string;
}

const CountdownTimer = ({ endTime }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <div>Time Left: {timeLeft}</div>;
};

export default CountdownTimer;
