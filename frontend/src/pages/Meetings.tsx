import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { callRequiredApi } from "@/service/Api/required_apis";
import { toast } from "sonner";

const Meetings = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [meetings, setMeetings] = useState<Array<{ id: string; title: string; attendee: string; email: string; date: string; time: string; status: "upcoming" | "completed" }>>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    const fetchData = async () => {
      const res = await callRequiredApi<"meetingsList", { page: number; pageSize: number }, { items: typeof meetings; total: number }>(
        "meetingsList",
        { page, pageSize },
      );
      if (res.success && res.data) {
        const data = res.data as { items: typeof meetings; total: number };
        setMeetings(data.items);
        setTotal(data.total);
      } else {
        toast.error(res.message || "Failed to load meetings");
      }
    };
    fetchData();
  }, [page, pageSize]);

  const handleDeleteMeeting = async (id: string) => {
    const res = await callRequiredApi<"meetingDelete", { id: string }, { id: string }>("meetingDelete", { id });
    if (res.success) {
      setMeetings(meetings.filter(m => m.id !== id));
      setTotal(prev => prev - 1);
      toast.success("Meeting cancelled successfully");
    } else {
      toast.error(res.message || "Failed to cancel meeting");
    }
  };

  const MeetingCard = ({ meeting }: { meeting: typeof meetings[0] }) => (
    <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Video className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{meeting.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <User className="w-3.5 h-3.5" />
            <span>{meeting.attendee}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{meeting.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{meeting.time}</span>
            </div>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Reschedule</DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => handleDeleteMeeting(meeting.id)}
          >
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground">View and manage all your scheduled meetings.</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              All Meetings
            </CardTitle>
            <CardDescription>
              {total} total meeting(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No meetings scheduled yet.</p>
              </div>
            ) : (
              meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground font-medium">
            Showing {Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} of {total} meetings
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground mr-2">
              Page {page} of {totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 px-4"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-9 px-4"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
