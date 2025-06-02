import LoadingSpinner from "@/components/ui/loading-spinner";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      void router.replace("/dashboard");
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn path="/sign-in" />
    </div>
  );
}
