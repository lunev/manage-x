import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  className?: string;
}

const ConfirmDeleteButton: React.FC<ConfirmDeleteButtonProps> = ({
  onConfirm,
  className = 'min-w-[100px] text-xs uppercase',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isConfirming && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isConfirming && countdown === 0) {
      setIsConfirming(false);
      setCountdown(5);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConfirming, countdown]);

  const handleFirstClick = () => {
    setIsConfirming(true);
    setCountdown(5);
  };

  const handleConfirmClick = () => {
    setIsConfirming(false);
    setCountdown(5);
    onConfirm();
  };

  if (isConfirming) {
    return (
      <Button type="button" variant="destructive" className={className} onClick={handleConfirmClick}>
        Confirm ({countdown})
      </Button>
    );
  }

  return (
    <Button type="button" variant="destructive" className={className} onClick={handleFirstClick}>
      Delete
    </Button>
  );
};

export default ConfirmDeleteButton;
