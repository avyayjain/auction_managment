export const formatCountdown = (endTime: string) => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const distance = end - now;

  if (distance < 0) return "Auction Ended";

  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};
