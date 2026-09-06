import { createContext, useContext } from "react";
import type { MentorIdentity } from "./mentorIdentity";

import { schools } from "@shared/data/mockData";

export type MentorContextValue = {
  identity: MentorIdentity;
  schoolId: string;
  schoolName: string;
};

export const MentorPageContext = createContext<MentorContextValue | null>(null);

export function useMentorContext(): MentorContextValue {
  const value = useContext(MentorPageContext);

  if (!value) {
    throw new Error(
      "useMentorContext must be used within MentorPageContext provider"
    );
  }

  return value;
}

export function getSchoolName(schoolId: string): string {
  return schools.find((item) => item.id === schoolId)?.name ?? "غير محددة";
}