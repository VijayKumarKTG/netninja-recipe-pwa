if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../sw.js')
    .catch((err) => console.log('service worker not registered.', err));
} else {
  console.log("Sorry, this app won't work in your browser");
}
