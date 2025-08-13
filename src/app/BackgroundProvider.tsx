import Iridescence from "../components/Iridescence";

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Iridescence color={[1, 1, 1]} speed={0.1} amplitude={0.1} />
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
