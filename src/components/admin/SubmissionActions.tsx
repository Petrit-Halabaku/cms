"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Archive, ArchiveRestore, MailOpen } from "lucide-react";

import {
  setSubmissionArchived,
  setSubmissionRead,
} from "@/lib/admin/actions/submissions";

export function SubmissionActions({ id, isArchived }: { id: string; isArchived: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>, redirectToList = false) =>
    startTransition(async () => {
      await fn();
      if (redirectToList) router.push("/admin/submissions");
      else router.refresh();
    });

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setSubmissionRead(id, false))}
        title="Mark as unread"
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <MailOpen className="h-3.5 w-3.5" aria-hidden /> Mark unread
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setSubmissionArchived(id, !isArchived), true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="h-3.5 w-3.5" aria-hidden /> Restore
          </>
        ) : (
          <>
            <Archive className="h-3.5 w-3.5" aria-hidden /> Archive
          </>
        )}
      </button>
    </div>
  );
}
