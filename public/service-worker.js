// public/service-worker.js
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { precacheAndRoute } from 'workbox-precaching';

console.warn("Service Worker file is in public folder");

const bgSyncPlugin = new BackgroundSyncPlugin('offline-queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  /\/api\/.*\/*.json/,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

precacheAndRoute(self.__WB_MANIFEST);
