import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Clock, Plus, Trash2, Link2, Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { callRequiredApi } from "@/service/Api/required_apis";

interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface Meeting {
  id: string;
  title: string;
  attendee: string;
  date: string;
  time: string;
}

const timeOptions = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<Array<{ id: string; link: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [slotsRes, linksRes, meetingsRes] = await Promise.all([
        callRequiredApi<"availabilityList", unknown, { id: string; date: string; start_time: string; end_time: string }[]>("availabilityList"),
        callRequiredApi<"linksList", unknown, { id: string; link: string }[]>("linksList"),
        callRequiredApi<"meetingsList", { pageSize: 100 }, { items: Meeting[] }>("meetingsList", { pageSize: 100 })
      ]);

      if (slotsRes.success && slotsRes.data) {
        const slots = (slotsRes.data as any[]).map(item => ({
          id: item.id,
          date: parseISO(item.date),
          startTime: item.start_time,
          endTime: item.end_time
        }));
        setAvailabilitySlots(slots);
      }

      if (linksRes.success && linksRes.data) {
        setGeneratedLinks(linksRes.data);
      }

      if (meetingsRes.success && meetingsRes.data) {
        setMeetings(meetingsRes.data.items);
      }
    };
    fetchData();
  }, []);

  const getBookingsForSlot = (slot: AvailabilitySlot) => {
    const slotDate = format(slot.date, "yyyy-MM-dd");
    return meetings.filter(m => m.date === slotDate && m.time >= slot.startTime && m.time < slot.endTime);
  };

  const handleSaveSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Please select date, start time, and end time");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be earlier than end time");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Frontend overlap check
    const isOverlapping = availabilitySlots.some(slot => {
      const slotDate = format(slot.date, "yyyy-MM-dd");
      if (slotDate !== formattedDate) return false;
      return startTime < slot.endTime && endTime > slot.startTime;
    });

    if (isOverlapping) {
      toast.error("This slot overlaps with an existing availability");
      return;
    }

    const newSlot: AvailabilitySlot = {
      id: Date.now().toString(),
      date: selectedDate,
      startTime,
      endTime,
    };

    const payload = {
      date: formattedDate,
      startTime,
      endTime,
    };
    const res = await callRequiredApi<"availabilityCreate", typeof payload, { id: string }>("availabilityCreate", payload);
    if (res.success && res.data) {
      const id = (res.data as { id: string }).id;
      setAvailabilitySlots([...availabilitySlots, { ...newSlot, id }]);
      setSelectedDate(undefined);
      setStartTime("");
      setEndTime("");
      toast.success("Availability slot saved!");
    } else {
      toast.error(res.message || "Failed to save slot");
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const slot = availabilitySlots.find(s => s.id === id);
    if (!slot) return;

    const res = await callRequiredApi<"availabilityDelete", { id: string }, { id: string }>("availabilityDelete", { id });
    if (res.success) {
      setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== id));
      // Also update local meetings state if they were deleted on backend
      setMeetings(meetings.filter(m => {
        const slotDate = format(slot.date, "yyyy-MM-dd");
        return !(m.date === slotDate && m.time >= slot.startTime && m.time < slot.endTime);
      }));
      toast.success("Slot and associated bookings removed");
    } else {
      toast.error(res.message || "Failed to remove slot");
    }
  };

  const handleGenerateLink = async () => {
    if (availabilitySlots.length === 0) {
      toast.error("Please add at least one availability slot");
      return;
    }

    // Strictly allow only one link at a time
    if (generatedLinks.length >= 1) {
      toast.error("You already have an active booking link. Delete it to generate a new one.");
      return;
    }

    const res = await callRequiredApi<"linkGenerate", unknown, { link: string; id: string }>("linkGenerate");
    if (res.success && res.data) {
      const data = (res.data as { link: string; id: string });
      setGeneratedLinks([data, ...generatedLinks]);
      toast.success("Booking link generated!");
    } else {
      toast.error(res.message || "Failed to generate link");
    }
  };

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteLink = async (id: string) => {
    const res = await callRequiredApi<"linkDelete", { id: string }, { id: string }>("linkDelete", { id });
    if (res.success) {
      setGeneratedLinks(generatedLinks.filter(l => l.id !== id));
      toast.success("Link deleted");
    } else {
      toast.error(res.message || "Failed to delete link");
    }
  };

  // Group slots by date for the Events section
  const groupedSlots = availabilitySlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage your availability and booking links.</p>
          </div>
          <div className="flex items-center gap-3">
            {generatedLinks.length > 0 && (
              <Button 
                onClick={() => handleCopyLink(generatedLinks[0].link)} 
                variant="hero"
                className="shadow-lg shadow-primary/20"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Add Slot */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="shadow-card border-none bg-gradient-to-br from-card to-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  Add Slot
                </CardTitle>
                <CardDescription>
                  Set a new time range for bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Date</label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-medium h-12 rounded-xl border-border/60 hover:border-primary/50 transition-all",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {selectedDate ? format(selectedDate, "PPP") : "Choose a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Start</label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="h-12 rounded-xl border-border/60 hover:border-primary/50">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">End</label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="h-12 rounded-xl border-border/60 hover:border-primary/50">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveSlot} className="w-full h-12 rounded-xl font-bold shadow-soft hover:shadow-md transition-all" variant="hero">
                  Save Availability
                </Button>

                {generatedLinks.length === 0 && (
                  <Button 
                    onClick={handleGenerateLink} 
                    variant="outline"
                    disabled={availabilitySlots.length === 0}
                    className="w-full h-12 rounded-xl font-bold"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Booking Link
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Schedule Overview */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-card border-none h-full max-h-[750px] flex flex-col">
              <CardHeader className="border-b border-border/50 pb-6 flex flex-row items-center justify-between shrink-0">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    Schedule Overview
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your upcoming availability and events.
                  </CardDescription>
                </div>
                <div className="hidden sm:block">
                  <div className="px-4 py-2 bg-muted/50 rounded-full border border-border/50">
                    <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">
                      {availabilitySlots.length} Slots Total
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 overflow-y-auto flex-1 custom-scrollbar max-h-[500px]">
                {sortedDates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No events scheduled</h3>
                    <p className="text-muted-foreground mt-2 max-w-[280px]">
                      Add your availability slots to start receiving bookings.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-8 rounded-xl"
                      onClick={() => document.querySelector('button[variant="hero"]')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Add First Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sortedDates.map((dateKey) => {
                      const dateSlots = groupedSlots[dateKey];
                      const dateObj = new Date(dateKey);
                      
                      return (
                        <div key={dateKey} className="relative">
                          {/* Timeline Line */}
                          <div className="absolute top-16 bottom-[-40px] left-[24px] w-px bg-gradient-to-b from-primary/30 to-transparent hidden sm:block" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                            {/* Date Marker */}
                            <div className="flex-shrink-0 flex sm:flex-col items-center gap-3 sm:gap-1 w-full sm:w-12">
                              <div className="w-12 h-12 rounded-2xl bg-primary shadow-md shadow-primary/20 flex flex-col items-center justify-center text-white z-10">
                                <span className="text-[10px] font-bold uppercase leading-none mb-0.5">
                                  {format(dateObj, "MMM")}
                                </span>
                                <span className="text-xl font-extrabold leading-none">
                                  {format(dateObj, "d")}
                                </span>
                              </div>
                              <div className="sm:hidden flex flex-col">
                                <span className="text-sm font-bold text-foreground">{format(dateObj, "EEEE")}</span>
                                <span className="text-xs text-muted-foreground">{format(dateObj, "MMMM d, yyyy")}</span>
                              </div>
                              <span className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-tighter text-center mt-1">
                                {format(dateObj, "EEEE").substring(0, 3)}
                              </span>
                            </div>
                            
                            {/* Slots Container */}
                            <div className="flex-1 space-y-3">
                              <div className="hidden sm:flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-foreground/80 tracking-wide uppercase">
                                  {format(dateObj, "MMMM d, yyyy")}
                                </h4>
                                <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded-md border">
                                  {dateSlots.length} slot{dateSlots.length > 1 ? "s" : ""}
                                </span>
                              </div>
                              
                              <div className="grid gap-3 sm:grid-cols-2">
                                {dateSlots
                                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                  .map((slot) => {
                                    const slotBookings = getBookingsForSlot(slot);
                                    return (
                                      <div key={slot.id} className="space-y-2">
                                        <div
                                          className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/40 hover:bg-muted/50 transition-all group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background border border-border/50">
                                              <Clock className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                              <span className="font-bold text-foreground text-sm block">
                                                {slot.startTime} - {slot.endTime}
                                              </span>
                                              <span className={cn(
                                                "text-[10px] uppercase font-bold tracking-widest",
                                                slotBookings.length > 0 ? "text-primary" : "text-muted-foreground"
                                              )}>
                                                {slotBookings.length > 0 
                                                  ? `${slotBookings.length} Booked` 
                                                  : "Available"}
                                              </span>
                                            </div>
                                          </div>
                                          <Button
                                             variant="ghost"
                                             size="icon"
                                             onClick={() => handleDeleteSlot(slot.id)}
                                             className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                           >
                                             <Trash2 className="w-3.5 h-3.5" />
                                           </Button>
                                         </div>
                                       </div>
                                     );
                                   })}
                               </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
