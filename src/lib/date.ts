/**
 * Format date into a clean, human-readable relative time string
 * (e.g. "Just now", "2 min ago", "1 hr ago", "Yesterday", "3 days ago")
 */
export function formatRelativeTime(input: Date | number | string): string {
  if (!input) return "";

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) {
    return "Just now";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Format as short date for older items: e.g. "Oct 12"
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
