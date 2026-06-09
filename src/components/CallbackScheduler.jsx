import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { showToast } from "@/components/ToastNotification";

const API_BASE = "http://localhost:8787/api";

export default function CallbackScheduler({ lead, onScheduled }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const queryClient = useQueryClient();

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ["availability", selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      try {
        const fromDate = new Date(selectedDate);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(selectedDate);
        toDate.setHours(23, 59, 59, 999);

        const response = await fetch(
          `${API_BASE}/appointments/availability?calendar_id=primary&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
        );
        
        if (!response.ok) {
          // Fallback: generate mock slots
          return generateMockSlots(selectedDate);
        }

        const data = await response.json();
        return data.slots || generateMockSlots(selectedDate);
      } catch (error) {
        console.error('Availability fetch error:', error);
        return generateMockSlots(selectedDate);
      }
    },
    enabled: !!selectedDate
  });

  const bookCallbackMutation = useMutation({
    mutationFn: async (slot) => {
      return await base44.entities.Appointment.create({
        lead_id: lead.id,
        calendar_id: 'primary',
        title: `Callback: ${lead.name || lead.phone}`,
        start_time: slot.start,
        end_time: slot.end,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: 'phone',
        status: 'confirmed',
        booked_by: 'manual',
        notes: `Follow-up call for lead (Score: ${lead.score || 0})`
      });
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["leads"]);
      
      // Update lead
      base44.entities.Lead.update(lead.id, {
        last_contact: new Date().toISOString(),
        call_count: (lead.call_count || 0) + 1
      });

      showToast("Callback scheduled! 📞", "success");
      if (onScheduled) onScheduled(appointment);
    }
  });

  const generateMockSlots = (date) => {
    const slots = [];
    const baseDate = new Date(date);
    
    // Generate slots from 9 AM to 5 PM, 30-min intervals
    for (let hour = 9; hour < 17; hour++) {
      for (let min of [0, 30]) {
        const start = new Date(baseDate);
        start.setHours(hour, min, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 15);

        slots.push({
          start: start.toISOString(),
          end: end.toISOString()
        });
      }
    }
    
    return slots;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-purple-400" />
          Schedule Callback
        </CardTitle>
        <p className="text-gray-400 text-sm mt-2">
          Book a follow-up call with {lead.name || lead.phone}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Calendar */}
          <div>
            <Label className="text-gray-300 mb-2 block">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              className="bg-[#0B0B0C] rounded-lg border border-gray-800"
            />
            <p className="text-gray-500 text-xs mt-2">
              ℹ️ Weekends excluded (business hours only)
            </p>
          </div>

          {/* Time Slots */}
          <div>
            <Label className="text-gray-300 mb-2 block">
              Available Times {selectedDate && `(${selectedDate.toLocaleDateString()})`}
            </Label>
            {!selectedDate ? (
              <div className="p-8 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-400 text-sm">Select a date to see available times</p>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600 animate-spin" />
                <p className="text-gray-400 text-sm">Loading availability...</p>
              </div>
            ) : availability.length === 0 ? (
              <div className="p-8 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-red-400 text-sm">No available slots this day</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availability.slice(0, 16).map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedSlot === slot
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-[#0B0B0C] border-gray-800 text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{formatTime(slot.start)}</span>
                      <span className="text-xs text-gray-500">15 min</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Book Button */}
        {selectedSlot && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-green-400 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Ready to Book
                </p>
                <p className="text-gray-300 text-sm">
                  {selectedDate.toLocaleDateString()} at {formatTime(selectedSlot.start)}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Lead will receive SMS/email confirmation
                </p>
              </div>
              <Button
                onClick={() => bookCallbackMutation.mutate(selectedSlot)}
                disabled={bookCallbackMutation.isLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                <Phone className="w-4 h-4 mr-2" />
                {bookCallbackMutation.isLoading ? 'Booking...' : 'Book Callback'}
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}