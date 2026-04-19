import { MobileLayout } from "@/components/app/MobileLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MobileLayout>{children}</MobileLayout>;
}
