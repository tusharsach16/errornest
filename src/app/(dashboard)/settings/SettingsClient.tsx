"use client";

import { useState, useCallback } from "react";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";
import { ProfileForm } from "./components/ProfileForm";
import { PasswordForm } from "./components/PasswordForm";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    company: string;
    bio: string;
    memberSince: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="space-y-8 animate-hero" style={{ animationDelay: "60ms" }}>
      <ProfileForm user={user} onToast={setToast} />
      <PasswordForm onToast={setToast} />

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
      )}
    </div>
  );
}
