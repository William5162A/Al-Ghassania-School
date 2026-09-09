import { Route, Routes } from "react-router";
import { AppShell } from "@/layouts/AppShell";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
// import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/Login/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { SchoolsPage } from "@/pages/Schools/SchoolsPage";
import { SchoolDetailsPage } from "@/pages/Schools/SchoolDetailsPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";
import { StudentsPage } from "@/pages/Students/StudentsPage";
import { StudentDetailsPage } from "@/pages/Students/StudentDetailsPage";
import { ViolationsPage } from "@/pages/Violations/ViolationsPage";
import { ViolationDetailsPage } from "@/pages/Violations/ViolationDetailsPage";
import { OwnerOverviewPage } from "@/pages/Owner/OwnerOverviewPage";
import { OwnerReportsPage } from "@/pages/Owner/OwnerReportsPage";
import { OwnerActivityLogPage } from "@/pages/Owner/OwnerActivityLogPage";
import { OwnerSettingsPage } from "@/pages/Owner/OwnerSettingsPage";

import { OwnerPage } from "@/pages/Owner/OwnerPage";
import { AdminPage } from "@/pages/Admin/AdminPage";
import { MentorPage } from "@/pages/Mentor/MentorPage";
import { RecordViolationPage } from "@/pages/Mentor/RecordViolationPage";

import { AdminOverviewPage } from "@/pages/Admin/AdminOverviewPage";
import { AdminStudentsPage } from "@/pages/Admin/AdminStudentsPage";
import { AdminStudentDetailsPage } from "@/pages/Admin/AdminStudentDetailsPage";
import { AdminViolationsPage } from "@/pages/Admin/AdminViolationsPage";
import { AdminViolationDetailsPage } from "@/pages/Admin/AdminViolationDetailsPage";
import { AdminReportsPage } from "@/pages/Admin/AdminReportsPage";
import { AdminActivityLogPage } from "@/pages/Admin/AdminActivityLogPage";
import { AdminNotificationsPage } from "@/pages/Admin/AdminNotificationsPage";
import { AdminTransferPage } from "@/pages/Admin/AdminTransferPage";
import { AdminSettingsPage } from "@/pages/Admin/AdminSettingsPage";



import { ComponentsPreviewPage } from "@/pages/ComponentsPreview/ComponentsPreview";



export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/components-preview" element={<ComponentsPreviewPage />} />

      <Route path="/login" element={<LoginPage />}/>

     <Route path="/owner" element={<OwnerPage />}>
      <Route index element={<OwnerOverviewPage />} />

      <Route path="schools">
        <Route index element={<SchoolsPage />} />
        <Route path=":schoolId" element={<SchoolDetailsPage />} />
      </Route>

      <Route path="students">
        <Route index element={<StudentsPage />} />
        <Route path=":studentId" element={<StudentDetailsPage />} />
      </Route>

  <Route path="violations">
    <Route index element={<ViolationsPage />} />
    <Route
      path=":violationId"
      element={<ViolationDetailsPage />}
    />
  </Route>

  <Route path="reports" element={<OwnerReportsPage />} />

  <Route path="activity" element={<OwnerActivityLogPage />} />

  <Route path="settings" element={<OwnerSettingsPage />} />
</Route>
        

      <Route path="/admin" element={<AdminPage />}>
        <Route index element={<AdminOverviewPage />} />

        <Route path="students">
          <Route index element={<AdminStudentsPage />} />
          <Route path=":studentId" element={<AdminStudentDetailsPage />} />
        </Route>

        <Route path="violations">
          <Route index element={<AdminViolationsPage />} />
          <Route path=":violationId" element={<AdminViolationDetailsPage />} />
        </Route>

        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="activity" element={<AdminActivityLogPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="transfer" element={<AdminTransferPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="/mentor" element={<MentorPage />}>
  <Route index element={<RecordViolationPage />} />
  <Route path="record" element={<RecordViolationPage />} />
</Route>      
      
      

      <Route path="/app" element={<AppShell />}>
        <Route path="dashboard" element={<DashboardPage />} />
        

        <Route path="students">
          <Route index element={<StudentsPage />} />
          <Route path=":studentId" element={<StudentDetailsPage />} />
        </Route>

        <Route path="violations">
          <Route index element={<ViolationsPage />} />
          <Route path=":violationId" element={<ViolationDetailsPage />} />
        </Route>

        <Route path="schools">
          <Route index element={<SchoolsPage />} />
          <Route path=":schoolId" element={<SchoolDetailsPage />} />
        </Route>

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
