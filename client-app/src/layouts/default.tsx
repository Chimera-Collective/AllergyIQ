
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-2 sm:px-6 flex-grow sm:pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <p className="text-sm text-default-400">
          AllergyIQ 2024
        </p>
      </footer>
    </div>
  );
}
