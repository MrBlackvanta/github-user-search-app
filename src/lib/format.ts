const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AVATAR_WIDTHS = [70, 117, 140, 234];

export function formatJoined(isoDate: string) {
  const date = new Date(isoDate);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function avatarSrc(avatarUrl: string, width: number) {
  const url = new URL(avatarUrl);
  url.searchParams.set("s", String(width));
  return url.href;
}

export function avatarSrcSet(avatarUrl: string) {
  return AVATAR_WIDTHS.map(
    (width) => `${avatarSrc(avatarUrl, width)} ${width}w`,
  ).join(", ");
}
