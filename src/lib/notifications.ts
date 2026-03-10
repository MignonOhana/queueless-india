/**
 * Utility for Web Notifications API
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendTokenAlert = (position: number, businessName?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const message = position === 0 
    ? "It's your turn now! Please proceed to the counter." 
    : `You're #${position} in queue${businessName ? ` at ${businessName}` : ''}!`;

  new Notification('Queue Update - QueueLess India', {
    body: message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'queue-update',
    renotify: true,
  } as any);
};
