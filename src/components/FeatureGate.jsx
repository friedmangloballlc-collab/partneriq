import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import UpgradeModal from "./UpgradeModal";

export default function FeatureGate({ children, locked, featureName }) {
  const [showModal, setShowModal] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <div className="relative">
        {/* Show the first ~300px of content at full opacity, non-interactive */}
        <div className="overflow-hidden" style={{ maxHeight: 300 }}>
          <div className="pointer-events-none select-none">
            {children}
          </div>
        </div>

        {/* Gradient fade from transparent to background */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        {/* Upgrade prompt card */}
        <div className="flex flex-col items-center justify-center py-8 -mt-16 relative z-10">
          <div className="bg-card border rounded-xl p-6 shadow-lg text-center max-w-md">
            <Lock className="w-8 h-8 mx-auto mb-3 text-amber-500" aria-hidden="true" />
            <h3 className="font-semibold text-lg mb-1">Premium Feature</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to unlock {featureName || "this feature"} and get full access.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} featureName={featureName} />
    </>
  );
}
