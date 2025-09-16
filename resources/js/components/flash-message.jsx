// resources/js/Components/FlashMessageHandler.jsx

import { usePage } from "@inertiajs/react";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function FlashMessage() {
  const { props } = usePage();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // When a new flash message comes in, set the state and make it visible
    const { success, error } = props.flash;
    if (success) {
      setMessage(success);
      setType("success");
      setVisible(true);
      setIsAnimating(true);
    } else if (error) {
      setMessage(error);
      setType("error");
      setVisible(true);
      setIsAnimating(true);
    } else {
      // If there's no message, hide it
      handleClose();
    }
  }, [props.flash]);

  // Timer to automatically hide the message after 5 seconds
  useEffect(() => {
    if (visible && isAnimating) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // 5 seconds

      // Clear the timer if the component is unmounted or message changes
      return () => clearTimeout(timer);
    }
  }, [visible, isAnimating]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  if (!visible) {
    return null;
  }

  // Determine styles based on the message type
  const baseClasses = `
    fixed top-20 right-1 md:right-4 z-[100] max-w-sm rounded-xl shadow-2xl text-white px-6 py-4
    transform transition-all duration-300 ease-in-out backdrop-blur-sm
    ${isAnimating ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
  `;

  const typeClasses = {
    success: "bg-gradient-to-r from-green-500 to-green-600 border-l-4 border-green-300",
    error: "bg-gradient-to-r from-red-500 to-red-600 border-l-4 border-red-300",
  };

  const iconComponents = {
    success: <Check className="h-4 w-4" />,
    error: <X className="h-4 w-4" />,
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {iconComponents[type]}
          <span className="leading-relaxed font-medium">{message}</span>
        </div>
        <button
          onClick={handleClose}
          className="bg-opacity-20 hover:bg-opacity-30 ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white transition-all duration-200 hover:scale-110"
          aria-label="Close notification"
        >
          <X className={`h-4 w-4 ${type === "success" ? "text-green-600" : "text-red-600"}`} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-opacity-30 absolute bottom-0 left-0 h-1 overflow-hidden rounded-b-xl bg-white">
        <div
          className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${
            isAnimating ? "w-0" : "w-full"
          }`}
          style={{ width: isAnimating ? "100%" : "0%" }}
        />
      </div>
    </div>
  );
}
