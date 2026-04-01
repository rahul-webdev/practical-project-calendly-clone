import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { User, Mail, MapPin, Phone, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { callRequiredApi } from "@/service/Api/required_apis";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "+91 ",
    address: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(profile.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Phone validation
    const phoneTrimmed = profile.phone.trim().replace(/\s+/g, '');
    if (phoneTrimmed && phoneTrimmed !== "+91") {
      const phoneRegex = /^(?:\+91|91|0)?[6789]\d{9}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        newErrors.phone = "Invalid Indian mobile number format";
      }
    }

    // Address validation
    if (profile.address.length > 200) {
      newErrors.address = "Address cannot exceed 200 characters";
    }

    // Bio validation
    if (profile.bio.length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfile = async () => {
    try {
      const res = await callRequiredApi("getProfile");
      if (res.success && res.data) {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "+91 ",
          address: res.data.address || "",
          bio: res.data.bio || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the validation errors.");
      return;
    }
    setSaving(true);
    try {
      const res = await callRequiredApi("updateProfile", {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        bio: profile.bio.trim(),
      });
      if (res.success) {
        toast.success("Profile updated successfully!");
        setErrors({});
      } else {
        toast.error(res.message || "Failed to update profile");
        if ((res as any).errors) {
          const backendErrors: Record<string, string> = {};
          (res as any).errors.forEach((err: string) => {
            if (err.toLowerCase().includes("name")) backendErrors.name = err;
            if (err.toLowerCase().includes("phone")) backendErrors.phone = err;
            if (err.toLowerCase().includes("address")) backendErrors.address = err;
            if (err.toLowerCase().includes("bio")) backendErrors.bio = err;
          });
          setErrors(backendErrors);
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences.</p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and public profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className={cn("flex items-center gap-2", errors.name && "text-destructive")}>
                  <User className={cn("w-4 h-4", errors.name ? "text-destructive" : "text-muted-foreground")} />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={cn("h-11", errors.name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  placeholder="rahul@example.com"
                  className="h-11 bg-muted/50 cursor-not-allowed border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={cn("flex items-center gap-2", errors.phone && "text-destructive")}>
                  <Phone className={cn("w-4 h-4", errors.phone ? "text-destructive" : "text-muted-foreground")} />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className={cn("h-11", errors.phone && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.phone && (
                  <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className={cn("flex items-center gap-2", errors.address && "text-destructive")}>
                  <MapPin className={cn("w-4 h-4", errors.address ? "text-destructive" : "text-muted-foreground")} />
                  Address
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => {
                    setProfile({ ...profile, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: "" });
                  }}
                  placeholder="e.g. HSR Layout, Bangalore, Karnataka"
                  className={cn("h-11", errors.address && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.address && (
                  <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className={cn(errors.bio && "text-destructive")}>Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => {
                  setProfile({ ...profile, bio: e.target.value });
                  if (errors.bio) setErrors({ ...errors, bio: "" });
                }}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                className={cn("resize-none", errors.bio && "border-destructive focus-visible:ring-destructive")}
              />
              <div className="flex justify-between items-center">
                {errors.bio ? (
                  <p className="text-xs font-medium text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.bio}
                  </p>
                ) : (
                  <span />
                )}
                <p className={cn("text-xs text-muted-foreground", profile.bio.length > 500 && "text-destructive")}>
                  {profile.bio.length}/500
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} variant="hero" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;