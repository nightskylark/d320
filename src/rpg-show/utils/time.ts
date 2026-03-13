export const secondsLeft = (endsAt: number): number => {
  const diff = Math.ceil((endsAt - Date.now()) / 1000);
  return Math.max(0, diff);
};

export const formatClock = (value: number): string => {
  const safe = Math.max(0, value);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};
