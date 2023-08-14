"use client";
import Loading from "@/components/MVui/defaultLoading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  });

  return (
    <div className="my-h-screen flex items-center justify-center">
      <Loading />
    </div>
  );
}
