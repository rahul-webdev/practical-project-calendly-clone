import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, Link2 } from "lucide-react";
import { callRequiredApi } from "@/service/Api/required_apis";
import { toast } from "sonner";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: "Upcoming Meetings", value: "0", icon: Calendar, change: "" },
    { title: "Total Bookings", value: "0", icon: Users, change: "" },
    { title: "Hours Scheduled", value: "0h", icon: Clock, change: "" },
    { title: "Active Links", value: "0", icon: Link2, change: "" },
  ]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Array<{ title: string; attendee: string; time: string; date: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const res = await callRequiredApi<"dashboardStats", unknown, { upcomingMeetings: number; totalBookings: number; hoursScheduled: string; activeLinks: number; upcomingList: any[] }>("dashboardStats");
      if (res.success && res.data) {
        const d = res.data as { upcomingMeetings: number; totalBookings: number; hoursScheduled: string; activeLinks: number; upcomingList: any[] };
        setStats([
          { title: "Upcoming Meetings", value: String(d.upcomingMeetings), icon: Calendar, change: "" },
          { title: "Total Bookings", value: String(d.totalBookings), icon: Users, change: "" },
          { title: "Hours Scheduled", value: d.hoursScheduled, icon: Clock, change: "" },
          { title: "Active Links", value: String(d.activeLinks), icon: Link2, change: "" },
        ]);
        setUpcomingMeetings(d.upcomingList.map(m => ({
          title: m.title,
          attendee: m.attendee,
          time: m.time,
          date: m.date
        })));
      } else {
        toast.error(res.message || "Failed to load dashboard");
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your scheduling overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft hover:shadow-card transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Meetings */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming meetings</p>
              ) : (
                upcomingMeetings.map((meeting, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">{meeting.attendee}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground block">{meeting.date}</span>
                      <span className="text-sm text-muted-foreground block font-medium">{meeting.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
