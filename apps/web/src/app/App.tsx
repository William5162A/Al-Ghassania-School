import { AppProviders } from "@/app/providers";
import { HomePage } from "@/pages/HomePage";

export function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  );
}
