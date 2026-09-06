import { createContext, useContext } from "react";
import type { AdminIdentity } from "./adminIdentity";

import { schools } from "@shared/data/mockData";

export type AdminContextValue = {
  identity: AdminIdentity;
  schoolId: string;
  schoolName: string;
};

export const AdminPageContext = createContext<AdminContextValue | null>(null);

export function useAdminContext(): AdminContextValue {
  const value = useContext(AdminPageContext);

  if (!value) {
    throw new Error(
      "useAdminContext must be used within AdminPageContext provider"
    );
  }

  return value;
}

export function getSchoolName(schoolId: string): string {
  return schools.find((item) => item.id === schoolId)?.name ?? "غير محددة";
}
