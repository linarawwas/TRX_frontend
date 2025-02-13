import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// This will be replaced by the workbox build process with an array of files to precache.
/* eslint-disable-next-line no-restricted-globals */
console.log('self.__WB_MANIFEST:', self.__WB_MANIFEST);
/* eslint-disable-next-line no-restricted-globals */
precacheAndRoute(self.__WB_MANIFEST);

const bgSyncPlugin = new BackgroundSyncPlugin('offline-queue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  /\/api\/.*\/*.json/,
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

console.warn('Service Worker file is in src folder');
