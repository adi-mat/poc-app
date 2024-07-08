import "./globals.css";
import { Toaster } from "../components/ui/toaster";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <main className="h-full w-full">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
