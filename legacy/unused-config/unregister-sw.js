// Force unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        console.log('Unregistered service worker:', registration.scope, success);
      });
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name).then(function(success) {
        console.log('Deleted cache:', name, success);
      });
    }
  });
}

// Clear IndexedDB (optional - be careful!)
if ('indexedDB' in window) {
  indexedDB.databases().then(function(databases) {
    for(let db of databases) {
      if (db.name && !db.name.includes('grounded')) {
        indexedDB.deleteDatabase(db.name).onsuccess = function() {
          console.log('Deleted database:', db.name);
        };
      }
    }
  });
}

console.log('Service worker cleanup complete. Please refresh the page.');

