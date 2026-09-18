import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Copy, Link2, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { sharesApi } from "../api/misc";
import { apiErrorMessage } from "../api/client";
import type { DriveFile } from "../api/types";

export function ShareDialog({ file, onClose }: { file: DriveFile; onClose: () => void }) {
  const [permission, setPermission] = useState<"view" | "download">("download");
  const [password, setPassword] = useState("");
  const [expiresInHours, setExpiresInHours] = useState<string>("");
  const { data: shares, refetch } = useQuery({
    queryKey: ["shares", file.id],
    queryFn: () => sharesApi.listForFile(file.id),
  });

  async function handleCreate() {
    try {
      const { url } = await sharesApi.create(file.id, {
        permission,
        password: password || undefined,
        expiresInHours: expiresInHours ? Number(expiresInHours) : undefined,
      });
      await navigator.clipboard.writeText(`${window.location.origin}${url}`).catch(() => {});
      toast.success("Share link created and copied");
      setPassword("");
      setExpiresInHours("");
      refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create share link"));
    }
  }

  async function handleDisable(id: string) {
    await sharesApi.disable(id).catch((err) => toast.error(apiErrorMessage(err)));
    refetch();
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    toast.success("Link copied");
  }

  return (
    <Modal title={`Share "${file.originalName}"`} onClose={onClose} width="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-graphite-600 dark:text-graphite-300">Permission</span>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as "view" | "download")}
              className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-2 py-1.5 text-sm"
            >
              <option value="download">Can download</option>
              <option value="view">View only</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-graphite-600 dark:text-graphite-300">Expires in (hours)</span>
            <input
              type="number"
              min={1}
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(e.target.value)}
              placeholder="Never"
              className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <label className="text-sm block">
          <span className="block mb-1 text-graphite-600 dark:text-graphite-300">Password (optional)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank for no password"
            className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-graphite-900 dark:bg-brass-500 text-white text-sm font-medium py-2 hover:opacity-90"
        >
          <Link2 className="w-4 h-4" /> Create share link
        </button>

        {shares && shares.length > 0 && (
          <div className="pt-3 border-t border-graphite-200 dark:border-graphite-700 space-y-2">
            <p className="text-xs font-medium text-graphite-500">Active links</p>
            {shares.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm gap-2 rounded-md border border-graphite-200 dark:border-graphite-700 px-3 py-2"
              >
                <span className="font-mono text-xs truncate text-graphite-600 dark:text-graphite-300">
                  /share/{s.token}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {s.disabled ? (
                    <span className="text-xs text-graphite-400">Disabled</span>
                  ) : (
                    <>
                      <button onClick={() => copyLink(s.token)} title="Copy link">
                        <Copy className="w-4 h-4 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200" />
                      </button>
                      <button onClick={() => handleDisable(s.id)} title="Disable link">
                        <Trash2 className="w-4 h-4 text-graphite-400 hover:text-red-600" />
                      </button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
