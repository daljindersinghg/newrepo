// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyCL5-3z3mYVlJEeDDd2kk_xdTocsCAG9gg",
  authDomain: "sample-540f6.firebaseapp.com",
  projectId: "sample-540f6",
  storageBucket: "sample-540f6.firebasestorage.app",
  messagingSenderId: "957737940781",
  appId: "1:957737940781:web:9770fdf54b4082524e85a4"
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Appointment Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new appointment notification',
    icon: '/NearMe .Ai (350 x 180 px).png',
    badge: '/notification-badge.png',
    tag: `appointment-${payload.data?.appointmentId || 'notification'}`,
    data: {
      appointmentId: payload.data?.appointmentId,
      clinicId: payload.data?.clinicId,
      type: payload.data?.type || 'new_appointment',
      url: payload.data?.url || '/clinic/appointments',
      timestamp: new Date().toISOString()
    },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the appointment details page
    const url = event.notification.data?.url || '/clinic/appointments';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Notification dismissed');
  } else {
    // Default action - open the main appointments page
    const url = event.notification.data?.url || '/clinic/appointments';
    event.waitUntil(
      clients.openWindow(url)
    );
  }

  // Track notification interaction
  event.waitUntil(
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: event.action || 'click',
        appointmentId: event.notification.data?.appointmentId,
        clinicId: event.notification.data?.clinicId,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to track notification interaction:', error);
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  
  // Track notification dismissal
  event.waitUntil(
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'close',
        appointmentId: event.notification.data?.appointmentId,
        clinicId: event.notification.data?.clinicId,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to track notification close:', error);
    })
  );
});

// Handle push events (for additional processing)
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      // Additional processing can be done here
      // The notification display is handled by onBackgroundMessage
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
});

// Service worker installation
self.addEventListener('install', function(event) {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service worker activating...');
  event.waitUntil(clients.claim());
});