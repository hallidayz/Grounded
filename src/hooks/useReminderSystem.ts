import { useEffect } from 'react';
import { AppSettings } from '../types';
import { ALL_VALUES } from '../constants';
import { hasPermission, sendNotification } from '../services/notifications';

interface UseReminderSystemOptions {
  settings: AppSettings;
  selectedValueIds: string[];
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

export function useReminderSystem({
  settings,
  selectedValueIds,
  onUpdateSettings,
}: UseReminderSystemOptions) {
  useEffect(() => {
    if (!settings.reminders.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentDate = now.getDate(); // 1-31

      if (!hasPermission()) return;

      // Get the top value (North Star) from selected values
      const topValue = selectedValueIds.length > 0 
        ? ALL_VALUES.find(v => v.id === selectedValueIds[0])?.name || 'your values'
        : 'your values';
      let shouldNotify = false;
      let notificationBody = "";

      // Ensure frequency has a valid default value
      const frequency = settings.reminders.frequency || 'daily';
      
      switch (frequency) {
        case 'hourly':
          // Hourly: 8 AM to 8 PM only, check every minute at :00
          if (currentHour >= 8 && currentHour < 20 && currentMin === 0 && settings.reminders.lastNotifiedHour !== currentHour) {
            shouldNotify = true;
            notificationBody = `💛 Hourly Pulse: Are your actions right now aligned with your North Star (${topValue})?`;
          }
          break;
        
        case 'daily':
          // Daily: At specified time (check within 1 minute window)
          const [targetHour, targetMin] = settings.reminders.time.split(':').map(Number);
          if (currentHour === targetHour && currentMin === targetMin && settings.reminders.lastNotifiedDay !== today) {
            shouldNotify = true;
            notificationBody = `💛 Time for your daily Grounded check-in. Your North Star is ${topValue}.`;
          }
          break;
        
        case 'weekly':
          // Weekly: On specified day at specified time
          const targetDay = settings.reminders.dayOfWeek ?? 0;
          const [weeklyHour, weeklyMin] = settings.reminders.time.split(':').map(Number);
          if (currentDay === targetDay && currentHour === weeklyHour && currentMin === weeklyMin && settings.reminders.lastNotifiedWeek !== today) {
            shouldNotify = true;
            notificationBody = `💛 Weekly Reflection: Time to check in with your North Star (${topValue}).`;
          }
          break;
        
        case 'monthly':
          // Monthly: On specified day of month at specified time
          const targetDate = settings.reminders.dayOfMonth ?? 1;
          const [monthlyHour, monthlyMin] = settings.reminders.time.split(':').map(Number);
          if (currentDate === targetDate && currentHour === monthlyHour && currentMin === monthlyMin && settings.reminders.lastNotifiedMonth !== today) {
            shouldNotify = true;
            notificationBody = `💛 Monthly Reflection: Time to reflect on your North Star (${topValue}).`;
          }
          break;
        
        default:
          // Fallback to daily if frequency is invalid or undefined
          const [defaultHour, defaultMin] = settings.reminders.time.split(':').map(Number);
          if (currentHour === defaultHour && currentMin === defaultMin && settings.reminders.lastNotifiedDay !== today) {
            shouldNotify = true;
            notificationBody = `💛 Time for your daily Grounded check-in. Your North Star is ${topValue}.`;
          }
          break;
      }

      if (shouldNotify) {
        // Send notification using abstraction
        sendNotification('Grounded', {
          body: notificationBody,
          icon: '/favicon.ico'
        }).catch(err => {
          console.error('Failed to send notification:', err);
        });
        
        // Ntfy.sh push notification (if enabled)
        if (settings.reminders.useNtfyPush && settings.reminders.ntfyTopic) {
          import('../services/ntfyService').then(({ sendNtfyNotification }) => {
            sendNtfyNotification(
              notificationBody,
              'Grounded Reminder',
              {
                topic: settings.reminders.ntfyTopic,
                server: settings.reminders.ntfyServer
              }
            ).catch(err => {
              console.error('Failed to send ntfy notification:', err);
            });
          });
        }
        
        // Calendar event (if enabled)
        if (settings.reminders.useDeviceCalendar && frequency !== 'hourly') {
          const [hours, minutes] = settings.reminders.time.split(':').map(Number);
          const eventDate = new Date();
          eventDate.setHours(hours, minutes, 0, 0);
          
          // Create calendar event URL
          const calendarTitle = encodeURIComponent(`Grounded ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Check-in`);
          const calendarDescription = encodeURIComponent(notificationBody);
          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&details=${calendarDescription}&dates=${eventDate.toISOString().replace(/[-:]|\.\d{3}/g, '')}/${new Date(eventDate.getTime() + 30 * 60 * 1000).toISOString().replace(/[-:]|\.\d{3}/g, '')}`;
          
          // Only open if we haven't created an event for this reminder yet
          if (!settings.reminders.calendarEventId) {
            window.open(googleCalendarUrl, '_blank');
            onUpdateSettings(prev => ({
              ...prev,
              reminders: { ...prev.reminders, calendarEventId: Date.now().toString() }
            }));
          }
        }
        
        // Update last notified timestamp to prevent duplicates
        const updateData: Partial<AppSettings['reminders']> = {};
        if (frequency === 'hourly') {
          updateData.lastNotifiedHour = currentHour;
        } else if (frequency === 'daily') {
          updateData.lastNotifiedDay = today;
        } else if (frequency === 'weekly') {
          updateData.lastNotifiedWeek = today;
        } else if (frequency === 'monthly') {
          updateData.lastNotifiedMonth = today;
        }
        
        onUpdateSettings(prev => ({
          ...prev,
          reminders: { 
            ...prev.reminders,
            ...updateData
          }
        }));
      }
    };

    // Check every minute for accurate timing (especially for hourly reminders)
    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately on mount/enable

    return () => clearInterval(interval);
  }, [settings.reminders, selectedValueIds, onUpdateSettings]);
}

