import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "EcoLoop | Campus E-Waste Collection & Lifecycle Tracking",
  description:
    "Campus e-waste collection and tracking platform connecting students, collection teams, admins, and authorized recyclers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased bg-black">
      <body className="min-h-full flex flex-col bg-black text-[#f0f0fa]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
