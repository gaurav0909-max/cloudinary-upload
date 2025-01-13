import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const font = Space_Grotesk({ weight: ["300", "600"], subsets: ["latin"] });
export const metadata = {
  title: "Clodinary Media Uploader",
  description:
    "Effortlessly upload images and documents to Cloudinary and get instant shareable URLs for seamless integration.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>{children}</body>
    </html>
  );
}
