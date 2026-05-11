"use client";

import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/lib/api/payment.api";
import { ROUTES } from "@/lib/constants";
import { useAppSelector } from "@/store/hooks";
import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BuyNowButtonProps {
  courseId: string;
  price: number;
  instructorId: string;
  isEnrolled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  label?: string;
}

interface FetchError {
  status?: number;
  data?: { message?: string; code?: string };
}

export function BuyNowButton({
  courseId,
  price,
  instructorId,
  isEnrolled,
  className,
  size = "default",
  fullWidth = false,
  label = "Buy Now",
}: BuyNowButtonProps) {
  const router = useRouter();
  const { status, user } = useAppSelector((s) => s.auth);
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();

  const currentUserId = user?._id || user?.id;
  const isOwnCourse = currentUserId && currentUserId === instructorId;

  if (price <= 0 || isOwnCourse || isEnrolled) return null;

  const handleClick = async () => {
    if (status !== "authenticated") {
      toast.info("Sign in to continue", {
        description: "You need an account to purchase courses.",
      });
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      const result = await createCheckoutSession({ courseId }).unwrap();
      console.log("result", result);

      // support multiple response shapes: result.url OR result.data.url
      const raw = result as unknown as {
        url?: string;
        data?: { url?: string; session?: { url?: string } };
      };
      const redirectUrl = raw?.url ?? raw?.data?.url ?? raw?.data?.session?.url;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        toast.error("Checkout failed", {
          description: "No redirect URL returned.",
        });
      }
    } catch (err) {
      const e = err as FetchError & { message?: string };
      const msg = e?.data?.message ?? e?.message ?? "Could not start checkout";

      if (e?.status === 409) {
        toast.warning("Already purchased", { description: msg });
      } else if (e?.status === 403) {
        toast.error("Not allowed", { description: msg });
      } else if (e?.status === 400) {
        toast.error("Invalid request", { description: msg });
      } else {
        toast.error("Checkout failed", { description: msg });
      }
    }
  };
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size={size}
      className={`${fullWidth ? "w-full" : ""} rounded-xs ${className ?? ""}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {isLoading ? "Redirecting…" : label}
    </Button>
  );
}
