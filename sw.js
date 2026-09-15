const CACHE_NAME = 'pomodoro-cache-v6';
const APP_FILES = ['./', './index.html', './styles.css', './app.js', './sw.js', './manifest.webmanifest', './icon.svg'];

function isAppClient(client) {
  const clientUrl = new URL(client.url);
  const scopeUrl = new URL(self.registration.scope);
  return clientUrl.origin === scopeUrl.origin && clientUrl.pathname.startsWith(scopeUrl.pathname);
}

async function getAppClient() {
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  const appClients = windowClients.filter(isAppClient);

  return appClients.find((client) => client.focused) ||
    appClients.find((client) => client.visibilityState === 'visible') ||
    appClients[0] ||
    null;
}

function getStartCommand(notification, action) {
  const data = notification.data;

  if (
    action !== 'start-next' ||
    !data ||
    data.type !== 'pomodoro-ready-session' ||
    !['work', 'break'].includes(data.expectedMode) ||
    typeof data.readySessionToken !== 'string' ||
    !data.readySessionToken
  ) {
    return null;
  }

  return {
    type: 'start-ready-session',
    expectedMode: data.expectedMode,
    readySessionToken: data.readySessionToken
  };
}

async function handleNotificationClick(notification, action) {
  const command = getStartCommand(notification, action);
  notification.close();

  const appClient = await getAppClient();

  if (appClient) {
    await appClient.focus();
    appClient.postMessage({
      type: 'notification-ready',
      expectedMode: command ? command.expectedMode : notification.data?.expectedMode,
      readySessionToken: command ? command.readySessionToken : notification.data?.readySessionToken,
      nextLabel: notification.data?.expectedMode === 'break' ? 'break' : 'focus',
      startRequested: Boolean(command)
    });

    return;
  }

  const appUrl = new URL('./', self.registration.scope);

  if (command) {
    appUrl.searchParams.set('notificationAction', 'start-next');
    appUrl.searchParams.set('expectedMode', command.expectedMode);
    appUrl.searchParams.set('readySessionToken', command.readySessionToken);
  }

  await self.clients.openWindow(appUrl.href);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(
    handleNotificationClick(event.notification, event.action).catch((error) => {
      console.warn('Unable to handle notification click.', error);
    })
  );
});
