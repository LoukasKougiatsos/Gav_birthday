// Minimal push service worker - just enough to show a notification and
// focus/open the app on click. No offline caching (this site isn't trying
// to work offline, just to notify).

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Κοριτσάκι", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Κοριτσάκι", {
      body: data.body,
      icon: "/icons/icon-192.jpg",
      badge: "/icons/icon-192.jpg",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
