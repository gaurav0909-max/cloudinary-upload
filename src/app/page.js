import CloudinaryUploader from "@/components/cloudinary-uploader";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <CloudinaryUploader />
    </main>
  );
}
