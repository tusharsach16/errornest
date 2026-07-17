import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "../actions";
import { MiniSpinner } from "@/components/MiniSpinner";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    company: string;
    bio: string;
    memberSince: string;
  };
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

export function ProfileForm({ user, onToast }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company);
  const [bio, setBio] = useState(user.bio);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileError("Name is required.");
      return;
    }

    startProfileTransition(async () => {
      const result = await updateProfileAction(trimmedName, company.trim(), bio.trim());
      if (!result.ok) {
        setProfileError(result.error);
        return;
      }
      onToast({ message: "Profile updated successfully.", variant: "success" });
      router.refresh();
    });
  };

  return (
    <section aria-labelledby="profile-heading">
      <div className="rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 p-6 shadow-sm transition-all duration-[250ms] hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="mb-6">
          <h2 id="profile-heading" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Profile Information
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Update your personal information and biography.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
          {profileError && (
            <div role="alert" className="rounded-input border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
              {profileError}
            </div>
          )}

          <div>
            <label htmlFor="profile-email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="w-full rounded-input border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 select-all cursor-not-allowed focus:outline-none"
              style={{ minHeight: "44px" }}
            />
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Member since <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.memberSince}</span>. Email is tied to your account credentials and cannot be changed.
            </p>
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProfilePending}
              required
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label htmlFor="profile-company" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Company
            </label>
            <input
              id="profile-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isProfilePending}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isProfilePending}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60 resize-y"
              style={{ minHeight: "88px" }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProfilePending}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              style={{ minHeight: "44px" }}
            >
              {isProfilePending ? <MiniSpinner className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
              {isProfilePending ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
