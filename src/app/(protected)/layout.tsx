import ProtectedLayout from "@/storage/components/ProtectedLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
