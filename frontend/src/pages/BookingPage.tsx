import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { callRequiredApi } from "@/service/Api/required_apis";

const BookingPage = () => {
  const { linkId } = useParams();
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);
  const [alreadyBooked, setAlreadyBooked] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Check if user already booked for this link using localStorage
    if (linkId) {
      const savedBooking = localStorage.getItem(`booked_${linkId}`);
      if (savedBooking) {
        setAlreadyBooked(JSON.parse(savedBooking));
      }
    }
  }, [linkId]);

  useEffect(() => {
    const checkLinkValidity = async () => {
      if (!linkId) return;
      // We can use availableSlots with a dummy date to check if link exists
      const res = await callRequiredApi<"availableSlots", { id: string; date: string }, string[]>(
        "availableSlots",
        { id: linkId, date: "2000-01-01" }
      );
      if (!res.success && res.message?.includes("Invalid link")) {
        setIsLinkValid(false);
      } else {
        setIsLinkValid(true);
      }
    };
    checkLinkValidity();
  }, [linkId]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedDate || !linkId || isLinkValid === false) return;
      
      setIsLoadingTimes(true);
      const res = await callRequiredApi<"availableSlots", { id: string; date: string }, string[]>(
        "availableSlots",
        { id: linkId, date: format(selectedDate, "yyyy-MM-dd") }
      );
      
      if (res.success && res.data) {
        setAvailableTimes(res.data);
      } else {
        setAvailableTimes([]);
        if (res.message !== "No slots found") {
           // toast.error(res.message || "Failed to load available times");
        }
      }
      setIsLoadingTimes(false);
    };

    fetchAvailableTimes();
  }, [selectedDate, linkId]);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }
    setStep("confirm");
  };

  const handleBook = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!selectedDate || !selectedTime || !linkId) {
      toast.error("Missing selected date or time");
      return;
    }
    const payload = {
      linkId,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      name: formData.name,
      email: formData.email,
    };
    const res = await callRequiredApi<"bookingCreate", typeof payload, { id: string }>("bookingCreate", payload);
    if (res.success) {
      // Save to localStorage to prevent re-booking
      const bookingInfo = {
        name: formData.name,
        email: formData.email,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        bookedAt: new Date().toISOString()
      };
      localStorage.setItem(`booked_${linkId}`, JSON.stringify(bookingInfo));
      
      setStep("done");
      toast.success("Meeting booked successfully!");
    } else {
      toast.error(res.message || "Failed to book meeting");
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">You're Booked!</h2>
            <p className="text-muted-foreground mb-6">
              A confirmation email has been sent to {formData.email || alreadyBooked?.email}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-3 mb-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : (alreadyBooked?.date && format(new Date(alreadyBooked.date), "EEEE, MMMM d, yyyy"))}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{selectedTime || alreadyBooked?.time}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyBooked) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Already Booked</h2>
            <p className="text-muted-foreground mb-6">
              You have already scheduled a meeting using this link.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left border border-blue-100">
              <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">Your Booking Details</p>
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{alreadyBooked.name}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">
                  {format(new Date(alreadyBooked.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{alreadyBooked.time}</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem(`booked_${linkId}`);
              setAlreadyBooked(null);
            }} className="mt-6 w-full">
              Book Another Meeting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLinkValid === false) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4">404</h1>
            <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Link</h2>
            <p className="text-muted-foreground mb-8">
              This booking link doesn't exist or has been removed.
            </p>
            <Button variant="hero" onClick={() => window.location.href = "/"} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLinkValid === null) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center border-b border-border pb-6">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Book a Meeting</CardTitle>
          <CardDescription>
            Select a time that works for you
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {step === "select" ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  className="rounded-lg border border-border pointer-events-auto"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-foreground">Available Times</Label>
                {isLoadingTimes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "hero" : "outline"}
                        className={cn(
                          "h-12 text-sm font-medium transition-all",
                          selectedTime === time ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50 hover:bg-primary/5"
                        )}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No available slots for this date.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border">
                    <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Select a date to see available times.</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Button 
                  onClick={handleContinue} 
                  variant="hero" 
                  className="w-full"
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-6">
              {/* Selected Time Summary */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{selectedTime}</span>
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("select")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleBook} 
                  variant="hero" 
                  className="flex-1"
                >
                  Book Meeting
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;
