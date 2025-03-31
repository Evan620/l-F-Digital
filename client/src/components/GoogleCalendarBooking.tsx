import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export interface TimeSlot {
  id: number;
  date: string;
  time: string;
  available: boolean;
}

interface GoogleCalendarBookingProps {
  onClose?: () => void;
  redirectAfterBooking?: boolean;
  serviceType?: string;
}

export default function GoogleCalendarBooking({ 
  onClose, 
  redirectAfterBooking = false,
  serviceType = "Business Consultation"
}: GoogleCalendarBookingProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeId, setSelectedTimeId] = useState<number | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [businessDescription, setBusinessDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Generate available dates starting from tomorrow for next 14 days
  const generateAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  // Generate time slots for the selected date
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const timeSlots: TimeSlot[] = [];
    const times = [
      "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", 
      "02:00 PM", "03:00 PM", "04:00 PM"
    ];
    
    // Simulate some slots being unavailable
    const randomUnavailable = new Set<number>();
    while (randomUnavailable.size < 2) {
      randomUnavailable.add(Math.floor(Math.random() * times.length));
    }
    
    times.forEach((time, index) => {
      timeSlots.push({
        id: index + 1,
        date,
        time,
        available: !randomUnavailable.has(index)
      });
    });
    
    return timeSlots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeId(null);
  };

  const handleTimeSelect = (id: number) => {
    setSelectedTimeId(id);
  };

  const handleNext = () => {
    if (step === 1 && (!selectedDate || !selectedTimeId)) {
      toast({
        title: "Please select a date and time",
        description: "You need to pick an available date and time slot to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && (!fullName || !email || !companyName)) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeId);
      if (!selectedSlot) {
        throw new Error("Selected time slot not found");
      }
      
      // In a real implementation, this would call your API to create the Google Calendar event
      // For now we'll just simulate a successful booking
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Google Calendar event would be created with these details:
      const eventDetails = {
        summary: `${serviceType} with ${fullName}`,
        description: `Company: ${companyName}\nEmail: ${email}\nPhone: ${phone}\n\n${businessDescription}`,
        start: {
          dateTime: `${selectedDate}T${selectedSlot.time.includes('PM') ? 
            (parseInt(selectedSlot.time) + 12).toString() : 
            selectedSlot.time.split(':')[0]}:00:00`,
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: `${selectedDate}T${selectedSlot.time.includes('PM') ? 
            (parseInt(selectedSlot.time) + 13).toString() : 
            (parseInt(selectedSlot.time.split(':')[0]) + 1).toString()}:00:00`,
          timeZone: 'America/New_York'
        },
        attendees: [
          { email: email },
          { email: 'consultant@lf-digital.com' } // Your company email
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };
      
      console.log('Event would be created with:', eventDetails);
      
      toast({
        title: "Consultation Scheduled!",
        description: `Your consultation is confirmed for ${selectedDate} at ${selectedSlot.time}.`,
      });
      
      setIsOpen(false);
      
      if (redirectAfterBooking) {
        // Redirect to thank you page or dashboard
        setTimeout(() => {
          window.location.href = '/thank-you';
        }, 2000);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error scheduling consultation:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error scheduling your consultation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getTimeSlotLabel = () => {
    const slot = timeSlots.find(slot => slot.id === selectedTimeId);
    return slot ? `${selectedDate} at ${slot.time}` : 'Select a time slot';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-neutral-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Schedule Your Consultation</DialogTitle>
          <DialogDescription className="text-neutral-300">
            Pick a date and time that works for you.
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Select Date</label>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger className="bg-neutral-900 border-neutral-700">
                  <SelectValue placeholder="Pick a date" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700">
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date} className="text-neutral-200">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Select Time</label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map(slot => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeId === slot.id ? "default" : "outline"}
                      className={`justify-start ${selectedTimeId === slot.id ? 'bg-primary-600' : 'bg-neutral-900 border-neutral-700'} ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => slot.available && handleTimeSelect(slot.id)}
                      disabled={!slot.available}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.time}
                      {!slot.available && <span className="ml-1 text-xs">(Booked)</span>}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleNext} disabled={!selectedDate || !selectedTimeId}>
                Next
              </Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-primary-900/20 p-3 rounded-md border border-primary-700/30 mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary-400 mr-2" />
                <span className="text-primary-300 font-medium">{getTimeSlotLabel()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Full Name *</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-neutral-900 border-neutral-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-neutral-900 border-neutral-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="bg-neutral-900 border-neutral-700"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Company Name *</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="bg-neutral-900 border-neutral-700"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack} className="border-neutral-700">
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-primary-900/20 p-3 rounded-md border border-primary-700/30 mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary-400 mr-2" />
                <span className="text-primary-300 font-medium">{getTimeSlotLabel()}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                What would you like to discuss during the consultation?
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Tell us about your business challenges and what you hope to achieve..."
                className="w-full h-32 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500"
              />
            </div>
            
            <div className="bg-neutral-900/50 p-4 rounded-md border border-neutral-700 mt-4">
              <h4 className="font-medium text-white mb-2">Consultation Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Type:</span>
                  <span className="text-neutral-100">{serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Duration:</span>
                  <span className="text-neutral-100">60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Format:</span>
                  <span className="text-neutral-100">Video Call (Google Meet)</span>
                </div>
                <Separator className="my-2 bg-neutral-700" />
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cost:</span>
                  <span className="text-primary-400 font-medium">Free consultation</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack} className="border-neutral-700">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-500"
              >
                {submitting ? 'Scheduling...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}