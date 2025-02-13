/* eslint-disable no-restricted-globals */

export default function swDev() {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.warn('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.error('Service Workers are not supported in this browser.');
    }
  }
  