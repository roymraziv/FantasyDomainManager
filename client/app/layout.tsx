import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Fantasy Domain Manager",
  description: "Manage your fantasy domains, heroes, troops, and enterprises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
