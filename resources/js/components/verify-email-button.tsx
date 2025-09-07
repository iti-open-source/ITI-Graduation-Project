import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerifyEmailButton() {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    router.post(
      "/email/verification-notification",
      {},
      {
        onSuccess: () => {
          toast.success("Verification email sent!");
        },
        onError: () => {
          toast.error("Something went wrong, please try again.");
        },
        onFinish: () => {
          setLoading(false);
        },
      },
    );
  };

  return (
    <button
      onClick={handleVerify}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${loading ? "cursor-not-allowed bg-gray-200 text-gray-500" : "bg-red-100 text-red-700 hover:bg-red-200"} `}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center rounded-full text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin align-middle" />
            <span className="ml-1">Sending</span>
          </span>
        </>
      ) : hovered ? (
        "Verify now"
      ) : (
        "Unverified"
      )}
    </button>
  );
}
