import { useMemo } from "react";
import { Navigate, Outlet } from "react-router";
import { MentorHeader } from "./components/MentorHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MentorPageContext, getSchoolName } from "./mentorContext";
import { readCurrentMentor } from "./mentorIdentity";
import type { MentorIdentity } from "./mentorIdentity";

export function MentorPage() {
  const identity = readCurrentMentor();
  const schoolId = identity?.schoolId;

  const contextValue = useMemo(
    () => ({
      identity: identity as MentorIdentity,
      schoolId: schoolId as string,
      schoolName: schoolId ? getSchoolName(schoolId) : "",
    }),
    [identity, schoolId]
  );

  if (!schoolId || !identity) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ScrollToTop containerSelector="main.mx-auto" />
      <MentorPageContext.Provider value={contextValue}>
        <div
          dir="rtl"
          className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
        >
          <div className="min-w-0 flex-1">
            <MentorHeader identity={identity as MentorIdentity} schoolName={getSchoolName(schoolId as string)} />

            <main className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </MentorPageContext.Provider>
    </>
  );
}