// app/layout.tsx
export const metadata = {
  title: "MY-Dwelzo",
  description: "Real estate platform",
};

import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
