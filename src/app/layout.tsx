import { Providers } from "./providers";

export const metadata = {
  title: "Debate Tube",
  description: "Watch AIs debating each other on controversial topics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
