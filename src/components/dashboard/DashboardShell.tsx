"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import CommandPalette from "@/components/dashboard/CommandPalette";

interface DashboardShellProps {
  userName: string | null;
  userEmail: string | null;
  projects: { id: string; name: string }[];
  children: React.ReactNode;
}

export default function DashboardShell({ userName, userEmail, projects, children }: DashboardShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closePalette = useCallback(() => setCommandPaletteOpen(false), []);

  return (
    <>
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar
          userName={userName}
          userEmail={userEmail}
          onOpenCommandPalette={openPalette}
        />
        <main className="flex-1">{children}</main>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={closePalette}
        projects={projects}
      />
    </>
  );
}
