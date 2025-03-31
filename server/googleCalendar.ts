import axios from 'axios';
import { log } from './vite';

// Check if Google Calendar credentials are available
export function hasGoogleCalendarCredentials(): boolean {
  return !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && 
            process.env.GOOGLE_CALENDAR_CLIENT_SECRET && 
            process.env.GOOGLE_CALENDAR_REFRESH_TOKEN);
}

// Class to manage Google Calendar API interactions
export class GoogleCalendarManager {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private calendarId: string = 'primary'; // Default to primary calendar

  constructor(calendarId?: string) {
    if (calendarId) {
      this.calendarId = calendarId;
    }
  }

  // Get access token using refresh token
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token already
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      // If no refresh token, cannot proceed
      if (!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
        throw new Error('No Google Calendar refresh token available');
      }

      // Exchange refresh token for access token
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
          client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
          grant_type: 'refresh_token'
        }
      );

      // Store the new token and expiry
      this.accessToken = tokenResponse.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (tokenResponse.data.expires_in * 1000));
      
      // If no access token was returned, throw an error
      if (!this.accessToken) {
        throw new Error('No access token received from Google');
      }
      
      return this.accessToken;
    } catch (error) {
      log(`Error getting Google Calendar access token: ${error}`, 'google-calendar');
      throw new Error('Failed to authenticate with Google Calendar');
    }
  }

  // Create a new event in the calendar
  async createEvent(eventData: {
    summary: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    attendees: { email: string }[];
    timeZone?: string;
  }): Promise<any> {
    try {
      // Check credentials
      if (!hasGoogleCalendarCredentials()) {
        log('Missing Google Calendar credentials', 'google-calendar');
        return {
          success: false,
          error: 'Google Calendar is not configured. Please contact the administrator.'
        };
      }

      const accessToken = await this.getAccessToken();
      const timeZone = eventData.timeZone || 'America/New_York';

      // Create the event
      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        {
          summary: eventData.summary,
          description: eventData.description,
          start: {
            dateTime: eventData.startDateTime,
            timeZone
          },
          end: {
            dateTime: eventData.endDateTime,
            timeZone
          },
          attendees: eventData.attendees,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 }
            ]
          },
          conferenceData: {
            createRequest: {
              requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            conferenceDataVersion: 1
          }
        }
      );

      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        conferenceLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null
      };
    } catch (error: any) {
      log(`Error creating Google Calendar event: ${error.message}`, 'google-calendar');
      console.error('Google Calendar API error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: 'Failed to schedule the consultation. Please try again or contact support.'
      };
    }
  }

  // Get available time slots (checking for conflicts)
  async getAvailableTimeSlots(date: string): Promise<{
    date: string;
    availableSlots: { time: string; available: boolean }[];
  }> {
    try {
      // Check credentials
      if (!hasGoogleCalendarCredentials()) {
        log('Missing Google Calendar credentials', 'google-calendar');
        return {
          date,
          availableSlots: this.getDefaultTimeSlots(true) // Return all slots as available if no credentials
        };
      }

      const accessToken = await this.getAccessToken();
      
      // Set time boundaries to search
      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;
      
      // Get events for the specified day
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          params: {
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: 'startTime'
          }
        }
      );

      // Process existing events to identify busy times
      const busyTimes: { start: Date; end: Date }[] = response.data.items.map((event: any) => ({
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date)
      }));

      // Generate time slots and mark them as available/unavailable
      const standardTimeSlots = this.getDefaultTimeSlots(false);
      const availableSlots = standardTimeSlots.map(slot => {
        // Convert slot time to Date object for comparison
        const [hourStr, minuteStr, period] = slot.time.match(/(\d+):(\d+) ([AP]M)/)?.slice(1) || [];
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        // A slot is 1 hour long
        const slotEndDate = new Date(slotDate);
        slotEndDate.setHours(slotEndDate.getHours() + 1);
        
        // Check if this slot conflicts with any existing events
        const isConflicting = busyTimes.some(busyTime => {
          return (
            (slotDate >= busyTime.start && slotDate < busyTime.end) || // Slot start time is within a busy period
            (slotEndDate > busyTime.start && slotEndDate <= busyTime.end) || // Slot end time is within a busy period
            (slotDate <= busyTime.start && slotEndDate >= busyTime.end) // Slot completely covers a busy period
          );
        });
        
        return {
          time: slot.time,
          available: !isConflicting
        };
      });
      
      return {
        date,
        availableSlots
      };
    } catch (error) {
      log(`Error getting available slots: ${error}`, 'google-calendar');
      // Return default time slots if there's an error
      return {
        date,
        availableSlots: this.getDefaultTimeSlots(true) // Return all slots as available in case of error
      };
    }
  }

  // Generate default business hours time slots
  private getDefaultTimeSlots(allAvailable: boolean): { time: string; available: boolean }[] {
    const slots = [
      { time: '09:00 AM', available: allAvailable },
      { time: '10:00 AM', available: allAvailable },
      { time: '11:00 AM', available: allAvailable },
      { time: '01:00 PM', available: allAvailable },
      { time: '02:00 PM', available: allAvailable },
      { time: '03:00 PM', available: allAvailable },
      { time: '04:00 PM', available: allAvailable }
    ];
    
    if (!allAvailable) {
      // Randomly mark some slots as unavailable for testing
      const randomUnavailableCount = Math.floor(Math.random() * 3);
      // Use an array instead of a Set to avoid iterator issues
      const unavailableIndices: number[] = [];
      
      while (unavailableIndices.length < randomUnavailableCount) {
        const randomIndex = Math.floor(Math.random() * slots.length);
        if (!unavailableIndices.includes(randomIndex)) {
          unavailableIndices.push(randomIndex);
        }
      }
      
      // Mark the selected slots as unavailable
      unavailableIndices.forEach(index => {
        slots[index].available = false;
      });
    }
    
    return slots;
  }

  // Get available dates for the next N business days
  getAvailableDates(daysAhead: number = 14): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  }
}

// Create a singleton instance
export const googleCalendar = new GoogleCalendarManager();