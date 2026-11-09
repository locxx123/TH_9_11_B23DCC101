const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Hôm nay: HH:mm, ngày khác: dd/MM */
export function formatListTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return formatTime(ts);
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function formatLastSeen(ts?: number): string {
  if (!ts) {
    return 'Offline';
  }
  return `Offline · ${formatListTime(ts)}`;
}
