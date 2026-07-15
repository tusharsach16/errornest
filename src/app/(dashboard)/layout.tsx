import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { PrismaProjectRepository } from "@/server/repositories/prisma-project.repository";
import DashboardShell from "@/components/dashboard/DashboardShell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const userId = await getServerUserId();
  if (!userId) {
    redirect("/login");
  }

  const [user, projects] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    new PrismaProjectRepository().listForUser(userId),
  ]);

  const projectList = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="flex min-h-screen bg-page text-ink antialiased transition-colors duration-150 noise-bg">
      <DashboardShell
        userName={user?.name ?? null}
        userEmail={user?.email ?? null}
        projects={projectList}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
