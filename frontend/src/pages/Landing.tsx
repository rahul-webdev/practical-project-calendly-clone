import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Link2, CheckCircle, ArrowRight, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Set your availability once and let others book time with you effortlessly.",
    },
    {
      icon: Clock,
      title: "Time Zone Detection",
      description: "Automatically detect and convert time zones for seamless global scheduling.",
    },
    {
      icon: Users,
      title: "Team Coordination",
      description: "Schedule meetings with multiple team members simultaneously.",
    },
    {
      icon: Link2,
      title: "Shareable Links",
      description: "Generate unique booking links to share with clients and colleagues.",
    },
  ];

  const benefits = [
    "No more back-and-forth emails",
    "Professional booking experience",
    "Automatic calendar sync",
    "Customizable availability",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Schedulr</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span>Simple scheduling for busy professionals</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Scheduling Made{" "}
            <span className="text-gradient">Effortless for India</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Stop wasting time on scheduling. Share your link, let others pick a time, and focus on what matters most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Scheduling Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/login">View Demo</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Schedule Smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to eliminate scheduling friction and save you hours every week.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in just three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Set Your Availability", desc: "Choose the dates and times when you're free to meet." },
              { step: "2", title: "Share Your Link", desc: "Send your personalized scheduling link to clients or colleagues." },
              { step: "3", title: "Get Booked", desc: "They pick a time that works, and you both get a confirmation." },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-card border border-border rounded-3xl p-10 shadow-card">
            <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Take Control of Your Time?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of professionals who save hours every week with smart scheduling.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Get Started — It's Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Schedulr</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Schedulr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;