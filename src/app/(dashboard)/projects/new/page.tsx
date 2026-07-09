import type { Metadata } from "next";
import { NewProjectForm } from "./NewProjectForm";

export const metadata: Metadata = {
  title: "New Project — ErrorNest",
  description:
    "Create a new ErrorNest project to generate an API key and start sending errors from your application to the dashboard.",
};

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-[640px] px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create a project</h1>
      <p className="mt-2 text-sm text-gray-500">
        Give your project a name. You&apos;ll get a unique API key to start ingesting errors
        immediately.
      </p>
      <div className="mt-8">
        <NewProjectForm />
      </div>
    </main>
  );
}
