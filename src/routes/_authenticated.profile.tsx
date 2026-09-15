import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { track } from "@/utils/analytics";
import { profileQueryOptions } from "@/api/queries/options";
import { cvService, profileService, jobsService } from "@/api/services";
import type { ProfileData } from "@/api/types";
import { CVUploader } from "@/components/profile/CVUploader";
import { CVList, type CVFile } from "@/components/profile/CVList";
import { ProfileStrength } from "@/components/profile/ProfileStrength";
import { TagInput } from "@/components/ui/tag-input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQueryOptions());
  },
  component: ProfilePage,
});

const emptyProfile: ProfileData = {
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
};

const CONTACT_FIELDS = [
  ["name", "Full name", "Thandi Mokoena"],
  ["email", "Email", "you@example.com"],
  ["phone", "Phone", "+27 82 000 0000"],
  ["location", "Location", "Johannesburg, Gauteng"],
] as const;

const cardClass =
  "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

/** Education can arrive as text or as a parsed list from the CV. */
function formatEducation(education: unknown): string {
  if (!education) return "";
  if (typeof education === "string") return education;
  if (Array.isArray(education)) {
    return education
      .map((e: any) =>
        typeof e === "string" ? e : [e?.degree, e?.institution].filter(Boolean).join(", "),
      )
      .filter(Boolean)
      .join("; ");
  }
  return "";
}

/** Drops entries that are really section headings or run-together text. */
function isRealSkill(skill: string) {
  if (skill.length > 40) return false;
  if (
    skill.length > 20 &&
    /programming|languages|frameworks|tools|additional|skills/i.test(skill)
  )
    return false;
  return true;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-neutral-100 px-5 py-6 first:border-t-0 sm:px-6">
      <div className="mb-4">
        <h2 className="font-medium text-neutral-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-normal text-neutral-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Value({ children }: { children?: ReactNode }) {
  return children ? (
    <p className="break-words text-neutral-900">{children}</p>
  ) : (
    <p className="text-neutral-400">Not added yet</p>
  );
}

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQueryOptions());
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const bucketId = `cvs/${user?.id ?? ""}`;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [files, setFiles] = useState<CVFile[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setFileLoading(true);
      const cvs = await cvService.list();
      setFiles(
        cvs.map((cv) => ({
          $id: cv.$id, // Use Profile ID, not File ID, for deletion to work
          fileId: cv.cv_file_id, // Actual storage key, needed to mint a signed view URL
          name: cv.cv_filename || "CV.pdf",
          $createdAt: cv.$createdAt,
        })),
      );
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setFileLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const data = await cvService.delete(fileId);
      if ((data as { success?: boolean }).success !== false) {
        toast.show({ title: "CV deleted", variant: "success" });
        fetchFiles(); // refresh list
      } else {
        throw new Error((data as { error?: string }).error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.show({
        title: "Couldn't delete that CV",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  // Local editing state - initialized from profile or empty
  const [editForm, setEditForm] = useState<ProfileData>(profile || emptyProfile);

  // Sync local state with profile when it loads asynchronously
  useEffect(() => {
    if (profile && !isEditing) {
      setEditForm(profile);
    }
  }, [profile, isEditing]);

  const startEditing = () => {
    if (profile) setEditForm(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) setEditForm(profile);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!editForm) return;
    setLoading(true);

    try {
      const data = (await profileService.update(editForm)) as {
        success?: boolean;
        profile?: ProfileData;
        error?: string;
      };

      if (data.success === false) {
        toast.show({
          title: "Couldn't save your profile",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }

      // Use the profile data from the server response (source of truth)
      const updatedProfile = data.profile || editForm;
      queryClient.setQueryData(profileQueryOptions().queryKey, updatedProfile);
      setEditForm(updatedProfile);
      setIsEditing(false);
      toast.show({ title: "Profile saved", variant: "success" });
      track(
        "profile_saved",
        { notification_enabled: updatedProfile.notification_enabled },
        "app",
      );
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.show({
        title: "Couldn't save your profile",
        description: err instanceof Error ? err.message : "Please check your connection.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      setLoading(true);
      const data = await cvService.upload(file);
      const extractedProfile = data.profile;

      if (data.success && extractedProfile) {
        queryClient.setQueryData(profileQueryOptions().queryKey, extractedProfile);
        setEditForm(extractedProfile); // Update local form too
        setIsEditing(false);

        // Prime matches immediately after successful CV upload.
        try {
          await jobsService.findMatches({
            location: extractedProfile.location || "South Africa",
            max_results: 20,
            min_score: 0.0,
            force_refresh: true,
          });
        } catch (matchErr) {
          console.warn("Match refresh after upload failed:", matchErr);
        }
        toast.show({
          title: "Your profile is ready",
          description: "We read your CV and updated your details.",
          variant: "success",
        });
        track("profile_cv_uploaded", {}, "profile");
        fetchFiles(); // Refresh file list
        setShowUpload(false); // Hide upload box after success
      } else {
        toast.show({
          title: "We couldn't read that CV",
          description: data.error || "Please try again, or upload a different file.",
          variant: "error",
        });
      }
    } catch (e) {
      console.error(e);
      toast.show({
        title: "Upload failed",
        description: "Please check your connection and try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-4 md:py-12">
        <p className="mb-4 text-sm text-neutral-500">Profile</p>
        <h1 className="mb-4 text-4xl font-semibold leading-[1.08] tracking-tight text-balance md:text-5xl">
          Your profile starts with your CV.{" "}
          <span className="text-neutral-400">Upload it and we&apos;ll fill in the rest.</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-neutral-600 text-pretty">
          We read your details, skills, and experience. You can change anything
          afterwards.
        </p>
        <div className="rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-2 sm:p-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-3">
            <CVUploader onUpload={handleCVUpload} isUploading={loading} />
          </div>
        </div>
        <Link
          to="/dashboard"
          className="mt-6 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Skip for now
        </Link>
      </div>
    );
  }

  const visibleSkills = (profile.skills || []).filter(isRealSkill);
  const alertsOn = isEditing ? editForm.notification_enabled : profile.notification_enabled;
  const threshold = isEditing
    ? (editForm.notification_threshold ?? 70)
    : (profile.notification_threshold ?? 70);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-neutral-500">Profile</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {profile.name || "Your profile"}
          </h1>
          <p className="mt-2 max-w-xl text-neutral-600 text-pretty">
            This is what we match jobs against. The more accurate it is, the
            better your matches.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEditing}>
              Edit profile
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className={cardClass}>
          <Section title="About you">
            <div className="grid gap-5 sm:grid-cols-2">
              {CONTACT_FIELDS.map(([key, label, placeholder]) => (
                <Field key={key} label={label} htmlFor={`profile-${key}`}>
                  {isEditing ? (
                    <Input
                      id={`profile-${key}`}
                      value={editForm[key]}
                      onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      placeholder={placeholder}
                    />
                  ) : (
                    <Value>{profile[key]}</Value>
                  )}
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Experience">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Experience level" htmlFor="profile-experience">
                {isEditing ? (
                  <Input
                    id="profile-experience"
                    value={editForm.experience_level}
                    onChange={(e) =>
                      setEditForm({ ...editForm, experience_level: e.target.value })
                    }
                    placeholder="Graduate, 1 to 2 years"
                  />
                ) : (
                  <Value>{profile.experience_level}</Value>
                )}
              </Field>
              <Field label="Education" htmlFor="profile-education">
                {isEditing ? (
                  <Input
                    id="profile-education"
                    value={formatEducation(editForm.education)}
                    onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                    placeholder="BCom, University of Johannesburg"
                  />
                ) : (
                  <Value>{formatEducation(profile.education)}</Value>
                )}
              </Field>
            </div>
          </Section>

          <Section
            title="Skills"
            description={isEditing ? "Separate skills with commas." : undefined}
          >
            {isEditing ? (
              <Textarea
                value={editForm.skills.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    skills: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="min-h-[96px] rounded-xl border-neutral-200 bg-white"
                aria-label="Skills"
              />
            ) : visibleSkills.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {visibleSkills.map((skill, idx) => (
                  <li
                    key={`${skill}-${idx}`}
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-sm text-neutral-700"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <Value />
            )}
          </Section>

          <Section title="Strengths">
            {isEditing ? (
              <TagInput
                tags={editForm.strengths}
                setTags={(newTags) => setEditForm({ ...editForm, strengths: newTags })}
                placeholder="Add a strength, like Problem solving"
              />
            ) : (profile.strengths || []).length > 0 ? (
              <ul className="space-y-2">
                {profile.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-neutral-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" />
                    {strength}
                  </li>
                ))}
              </ul>
            ) : (
              <Value />
            )}
          </Section>

          <Section title="What you're looking for">
            {isEditing ? (
              <Textarea
                value={editForm.career_goals}
                onChange={(e) => setEditForm({ ...editForm, career_goals: e.target.value })}
                rows={4}
                className="rounded-xl border-neutral-200 bg-white"
                aria-label="Career goals"
                placeholder="The kind of role, industry, or next step you want."
              />
            ) : profile.career_goals ? (
              <p className="whitespace-pre-line leading-relaxed text-neutral-700">
                {profile.career_goals}
              </p>
            ) : (
              <Value />
            )}
          </Section>

          <Section title="Job alerts" description="Get an email when a new job fits you well.">
            <label
              htmlFor="notifications"
              className={cn(
                "flex items-center gap-3 text-neutral-900",
                isEditing ? "cursor-pointer" : "cursor-default",
              )}
            >
              <input
                type="checkbox"
                id="notifications"
                className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
                checked={!!alertsOn}
                onChange={(e) =>
                  isEditing &&
                  setEditForm({ ...editForm, notification_enabled: e.target.checked })
                }
                disabled={!isEditing}
              />
              Email me about strong matches
            </label>

            {alertsOn && (
              <div className="mt-5 max-w-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-neutral-500">Only jobs that fit at least</p>
                  <p className="text-sm font-medium tabular-nums">{threshold}%</p>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(vals) =>
                    isEditing && setEditForm({ ...editForm, notification_threshold: vals[0] })
                  }
                  max={100}
                  step={5}
                  disabled={!isEditing}
                  className="py-4"
                  aria-label="Minimum fit for alerts"
                />
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8">
          <ProfileStrength profile={isEditing ? editForm : profile} />

          <div className={cn(cardClass, "p-5")}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-neutral-900">Your CVs</h2>
              {files.length > 0 && !showUpload && (
                <Button variant="ghost" size="sm" onClick={() => setShowUpload(true)}>
                  <Plus />
                  Upload
                </Button>
              )}
            </div>

            {files.length === 0 && !fileLoading ? (
              <CVUploader onUpload={handleCVUpload} isUploading={loading} className="p-6" />
            ) : (
              <div className="space-y-4">
                {showUpload && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-500">Upload a new CV</p>
                      <button
                        type="button"
                        aria-label="Close upload"
                        onClick={() => setShowUpload(false)}
                        className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <CVUploader onUpload={handleCVUpload} isUploading={loading} className="p-6" />
                  </div>
                )}
                <CVList
                  files={files}
                  isLoading={fileLoading}
                  bucketId={bucketId}
                  onDelete={handleDeleteFile}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
