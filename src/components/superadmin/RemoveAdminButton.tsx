"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { removeAdminFromMosque } from "@/lib/actions/superadmin.actions";
import { Button } from "@/components/ui/button";

export default function RemoveAdminButton({
  mosqueId,
  userId,
  userName,
}: {
  mosqueId: number;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleRemove() {
    setLoading(true);
    await removeAdminFromMosque(mosqueId, userId);
    setLoading(false);
    router.refresh();
  }

  if (!confirm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirm(true)}
        className="text-red-600 hover:text-red-700"
      >
        Retirer
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">Retirer {userName} ?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={loading}
        className="text-red-600"
      >
        {loading ? "..." : "Oui"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
        Non
      </Button>
    </div>
  );
}
