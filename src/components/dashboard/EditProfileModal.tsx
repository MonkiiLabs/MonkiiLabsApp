import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Image as ImageIcon, Loader2, Sparkles, Twitter } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateProfile } from "@/features/api/hooks";
import type { UserProfile } from "@/features/api/types";
import { monkiiMark } from "@/lib/brand";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | undefined;
}

const COMPANION_PFPS = [
  {
    name: "Monkii Core",
    role: "Protocol Mark",
    url: monkiiMark,
  },
  {
    name: "Cyber Chimp",
    role: "Sentinel Recon",
    url: "/companions/cyber-chimp-drone.jpg",
  },
  {
    name: "Nano Baboon",
    role: "Core Battery",
    url: "/companions/nano-baboon-core.jpg",
  },
  {
    name: "Plasma Lemur",
    role: "Vitality Surge",
    url: "/companions/plasma-lemur.jpg",
  },
  {
    name: "Mecha Mandrill",
    role: "Defense Matrix",
    url: "/companions/mecha-mandrill.jpg",
  },
  {
    name: "Quantum Ape",
    role: "Quantum Hash",
    url: "/companions/quantum-ape-sentinel.jpg",
  },
  {
    name: "Celestial King",
    role: "Apex Sovereign",
    url: "/companions/celestial-king-monkii.jpg",
  },
];

export const EditProfileModal = ({ open, onOpenChange, user }: EditProfileModalProps) => {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? monkiiMark);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [xHandle, setXHandle] = useState(user?.xHandle ?? "");
  const [showCustomUrl, setShowCustomUrl] = useState(false);

  // Sync state whenever dialog opens with user data
  useEffect(() => {
    if (open && user) {
      setDisplayName(user.displayName ?? "");
      setAvatarUrl(user.avatarUrl ?? monkiiMark);
      setBio(user.bio ?? "");
      setXHandle(user.xHandle ?? "");
      const isArchetype = COMPANION_PFPS.some((c) => c.url === user.avatarUrl);
      setShowCustomUrl(Boolean(user.avatarUrl && !isArchetype));
    }
  }, [open, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        displayName: displayName.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        xHandle: xHandle.trim() || null,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-hair/15 bg-bench text-paper sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold text-paper">
            <Sparkles className="h-5 w-5 text-alive-lit" />
            {t("profile.editTitle", "Customize Nurturer Profile")}
          </DialogTitle>
          <DialogDescription className="text-xs text-paper-3">
            {t("profile.editDesc", "Set your persona, select a companion avatar, and link your socials across Monkii Labs.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Active Preview */}
          <div className="flex items-center gap-4 rounded-2xl border border-hair/10 bg-cream/40 p-4">
            <div className="relative">
              <img
                src={avatarUrl || monkiiMark}
                alt="Avatar preview"
                className="h-16 w-16 rounded-2xl border-2 border-alive/40 bg-bench object-cover shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = monkiiMark;
                }}
              />
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-alive text-[10px] text-paper-dark">
                ✓
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-paper">
                {displayName.trim() || t("profile.defaultName", "Anonymous Nurturer")}
              </p>
              {xHandle.trim() && (
                <p className="font-mono text-xs text-alive-lit">
                  @{xHandle.replace(/^@+/, "")}
                </p>
              )}
              <p className="line-clamp-2 mt-1 text-xs text-paper-3 italic">
                {bio.trim() || t("profile.noBioPlaceholder", "No bio provided yet.")}
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="displayName" className="font-mono text-xs font-semibold text-paper-2">
                {t("profile.displayNameLabel", "Display Name")}
              </label>
              <span className="font-mono text-[10px] text-paper-3">
                {displayName.length}/32
              </span>
            </div>
            <input
              id="displayName"
              type="text"
              maxLength={32}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. CyberApe 01"
              className="w-full rounded-xl border border-hair/15 bg-cream px-3.5 py-2 font-mono text-xs text-paper placeholder:text-paper-3/60 focus:border-alive-lit focus:outline-none"
            />
          </div>

          {/* Avatar Archetype Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-semibold text-paper-2">
                {t("profile.companionPfpLabel", "Companion Archetype PFP")}
              </label>
              <button
                type="button"
                onClick={() => setShowCustomUrl(!showCustomUrl)}
                className="font-mono text-[10px] text-alive-lit hover:underline"
              >
                {showCustomUrl ? t("profile.hideCustomUrl", "Pick Archetype") : t("profile.useCustomUrl", "Use Custom URL")}
              </button>
            </div>

            {showCustomUrl ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-paper-3" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... image URL"
                    className="w-full rounded-xl border border-hair/15 bg-cream px-3.5 py-2 font-mono text-xs text-paper placeholder:text-paper-3/60 focus:border-alive-lit focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-paper-3">
                  {t("profile.customUrlHint", "Paste a direct link to any PNG, JPG, or IPFS image.")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {COMPANION_PFPS.map((companion) => {
                  const isSelected = avatarUrl === companion.url;
                  return (
                    <button
                      key={companion.name}
                      type="button"
                      onClick={() => setAvatarUrl(companion.url)}
                      className={`group relative flex flex-col items-center rounded-xl border p-2 text-center transition-all ${
                        isSelected
                          ? "border-alive-lit bg-alive/15 ring-2 ring-alive-lit/40"
                          : "border-hair/10 bg-cream hover:border-hair/30 hover:bg-hair/[0.04]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-alive-lit text-[9px] text-paper-dark">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                      <img
                        src={companion.url}
                        alt={companion.name}
                        className="h-12 w-12 rounded-lg border border-hair/10 object-cover"
                      />
                      <span className="mt-1.5 line-clamp-1 font-mono text-[10px] font-bold text-paper group-hover:text-alive-lit">
                        {companion.name}
                      </span>
                      <span className="line-clamp-1 text-[9px] text-paper-3">
                        {companion.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="font-mono text-xs font-semibold text-paper-2">
                {t("profile.bioLabel", "Nurturer Bio")}
              </label>
              <span className="font-mono text-[10px] text-paper-3">
                {bio.length}/280
              </span>
            </div>
            <textarea
              id="bio"
              rows={3}
              maxLength={280}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other nurturers about your Proof-of-Life protocol role, staking strategy, or sentinel fleet..."
              className="w-full resize-none rounded-xl border border-hair/15 bg-cream p-3 font-mono text-xs text-paper placeholder:text-paper-3/60 focus:border-alive-lit focus:outline-none"
            />
          </div>

          {/* X (Twitter) Handle */}
          <div className="space-y-1.5">
            <label htmlFor="xHandle" className="font-mono text-xs font-semibold text-paper-2">
              {t("profile.xHandleLabel", "X (Twitter) Profile")}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-mono text-xs text-paper-3">
                @
              </span>
              <input
                id="xHandle"
                type="text"
                maxLength={32}
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value.replace(/^@+/, ""))}
                placeholder="username"
                className="w-full rounded-xl border border-hair/15 bg-cream py-2 pl-8 pr-3.5 font-mono text-xs text-paper placeholder:text-paper-3/60 focus:border-alive-lit focus:outline-none"
              />
              <Twitter className="absolute right-3.5 h-3.5 w-3.5 text-paper-3" />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={updateProfile.isPending}
              className="rounded-xl border border-hair/15 bg-cream px-4 py-2 font-mono text-xs font-semibold text-paper transition-colors hover:bg-hair/10"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-alive-lit/40 bg-alive px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-paper-dark shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("profile.saveButton", "Save Profile")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
