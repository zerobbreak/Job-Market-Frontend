import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  User,
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  Target,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/utils/api";
import { track } from "@/utils/analytics";
import type { Models } from "appwrite";
import type { OutletContextType } from "@/components/layout/RootLayout";
import { CVUploader } from "@/components/profile/CVUploader";
import { CVList } from "@/components/profile/CVList";

export default function Profile() {
  const { profile, setProfile } = useOutletContext<OutletContextType>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [files, setFiles] = useState<Models.File[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setFileLoading(true);
      // Use authenticated API endpoint that filters by user ID
      const response = await apiClient("/profile/list");
      const data = await response.json();

      if (data.success && data.profiles) {
        // Map API response to Models.File-like format for CVList component
        const mappedFiles = data.profiles.map((profile: any) => ({
          $id: profile.cv_file_id,
          name: profile.cv_filename || "CV.pdf",
          $createdAt: profile.$createdAt,
          $updatedAt: profile.$updatedAt,
        }));
        setFiles(mappedFiles);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setFileLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      // Use authenticated API endpoint for deletion
      const response = await apiClient(`/profile/${fileId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.show({
          title: "File deleted",
          description: "CV has been removed.",
          variant: "success",
        });
        fetchFiles(); // refresh list
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.show({
        title: "Delete failed",
        description: "Could not delete file.",
        variant: "error",
      });
    }
  };

  // Local editing state - initialized from profile or empty
  const [editForm, setEditForm] = useState(
    profile || {
      name: "",
      email: "",
      phone: "",
      location: "",
      skills: [],
      experience_level: "",
      education: "",
      strengths: [],
      career_goals: "",
      notification_enabled: false,
      notification_threshold: 70,
    }
  );

  const handleSaveProfile = async () => {
    if (!editForm) return;
    setLoading(true);

    try {
      const response = await apiClient("/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(editForm); // Update global state
        setIsEditing(false);
        toast.show({
          title: "Profile saved",
          description: "Your changes have been saved",
          variant: "success",
        });
        track(
          "profile_saved",
          { notification_enabled: editForm.notification_enabled },
          "app"
        );
      } else {
        toast.show({
          title: "Save failed",
          description: data.error || "Failed to update profile",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.show({
        title: "Error",
        description: "Failed to connect to server",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("cv", file);

      const response = await apiClient("/analyze-cv", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setEditForm(data.profile); // Update local form too
        setIsEditing(false);
        toast.show({
          title: "CV analyzed",
          description: "Your profile has been generated.",
          variant: "success",
        });
        track("profile_cv_uploaded", { filename: data.cv_filename }, "profile");
        fetchFiles(); // Refresh file list
        setShowUpload(false); // Hide upload box after success
      } else {
        toast.show({
          title: "Analyze failed",
          description: data.error || "Failed to analyze CV",
          variant: "error",
        });
      }
    } catch (e) {
      console.error(e);
      toast.show({
        title: "Upload error",
        description: "Error uploading CV. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    // Initial State: No profile, Force Upload
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to Job Market
            </h2>
            <p className="text-muted-foreground">
              Upload your CV to generate your AI profile and start matching with
              jobs instantly.
            </p>
          </div>

          <CVUploader onUpload={handleCVUpload} isUploading={loading} />

          <Button
            onClick={() => navigate("/app/dashboard")}
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            Skip to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional profile and resume
          </p>
        </div>
        <Button
          onClick={() => {
            if (isEditing) handleSaveProfile();
            else {
              setEditForm(profile);
              setIsEditing(true);
            }
          }}
          variant={isEditing ? "default" : "secondary"}
          disabled={loading}
          className="w-full sm:w-auto shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: CV Management */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card h-full border-border/60 shadow-md flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Resumes
              </CardTitle>
              <CardDescription>Manage your uploaded CVs</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              {files.length === 0 ? (
                <div className="flex-1 flex flex-col">
                  <CVUploader
                    onUpload={handleCVUpload}
                    isUploading={loading}
                    className="flex-1 min-h-[250px] flex justify-center !border-dashed !border-2"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {!showUpload ? (
                    <Button
                      onClick={() => setShowUpload(true)}
                      className="w-full border-dashed border-2 h-16 hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                      variant="outline"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Upload New CV
                    </Button>
                  ) : (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center px-1">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          New Upload
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowUpload(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CVUploader
                        onUpload={handleCVUpload}
                        isUploading={loading}
                        className="p-4"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground/80 px-1">
                      Your Files
                    </h4>
                    <CVList
                      files={files}
                      isLoading={fileLoading}
                      onDelete={handleDeleteFile}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/60 shadow-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Profile Details</CardTitle>
                  <CardDescription>
                    AI-analyzed information from your CV
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Full Name
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium">
                      {profile.name || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Location
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium">
                      {profile.location || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    Email
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  ) : (
                    <div
                      className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium truncate"
                      title={profile.email}
                    >
                      {profile.email || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-pink-500" />
                    Phone
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="+1 234 567 890"
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium">
                      {profile.phone || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills
                  </h4>
                  {isEditing && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Comma separated
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={editForm.skills.join(", ")}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        skills: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="min-h-[80px]"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No skills listed
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                {/* Experience */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    Experience Level
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.experience_level}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          experience_level: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium">
                      {profile.experience_level || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Education
                  </h4>
                  {isEditing ? (
                    <Input
                      value={editForm.education}
                      onChange={(e) =>
                        setEditForm({ ...editForm, education: e.target.value })
                      }
                    />
                  ) : (
                    <div
                      className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm line-clamp-2"
                      title={profile.education}
                    >
                      {profile.education || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-3 pt-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Key Strengths
                </h4>
                {isEditing ? (
                  <Textarea
                    value={editForm.strengths.join(", ")}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        strengths: e.target.value
                          .split(",")
                          .map((s) => s.trim()),
                      })
                    }
                    placeholder="Leadership, Communication..."
                  />
                ) : (
                  <ul className="space-y-2">
                    {profile.strengths.length > 0 ? (
                      profile.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-foreground/90 flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0 shadow-sm" />
                          {strength}
                        </li>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No strengths listed
                      </span>
                    )}
                  </ul>
                )}
              </div>

              {/* Career Goals */}
              <div className="space-y-3 pt-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Career Goals
                </h4>
                {isEditing ? (
                  <Textarea
                    value={editForm.career_goals}
                    onChange={(e) =>
                      setEditForm({ ...editForm, career_goals: e.target.value })
                    }
                    rows={4}
                  />
                ) : (
                  <div className="text-foreground/80 bg-muted/30 p-4 rounded-lg border border-border/50 text-sm leading-relaxed">
                    {profile.career_goals || "No career goals specified."}
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Preferences
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 bg-card p-3 rounded-lg border border-border/50">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="h-5 w-5 rounded border-input text-primary focus:ring-primary/25 bg-background transition-all"
                      checked={
                        isEditing
                          ? !!editForm.notification_enabled
                          : !!profile.notification_enabled
                      }
                      onChange={(e) =>
                        isEditing &&
                        setEditForm({
                          ...editForm,
                          notification_enabled: e.target.checked,
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Label
                      htmlFor="notifications"
                      className="cursor-pointer font-medium"
                    >
                      Enable email notifications for matches
                    </Label>
                  </div>

                  {(isEditing
                    ? editForm.notification_enabled
                    : profile.notification_enabled) && (
                    <div className="space-y-4 max-w-sm pl-1 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-end">
                        <Label className="text-sm text-muted-foreground">
                          Match Score Threshold
                        </Label>
                        <Badge variant="outline" className="font-mono">
                          {isEditing
                            ? editForm.notification_threshold
                            : profile.notification_threshold}
                          %
                        </Badge>
                      </div>
                      <Slider
                        value={[
                          isEditing
                            ? editForm.notification_threshold ?? 70
                            : profile.notification_threshold ?? 70,
                        ]}
                        onValueChange={(vals) =>
                          isEditing &&
                          setEditForm({
                            ...editForm,
                            notification_threshold: vals[0],
                          })
                        }
                        max={100}
                        step={5}
                        disabled={!isEditing}
                        className="py-4"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
