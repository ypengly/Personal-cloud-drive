import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, HardDrive, Lock } from "lucide-react";
import { FileIcon } from "../components/FileIcon";
import { formatBytes } from "../lib/format";
import { canPreview, fileKind } from "../lib/format";

export function SharedFilePage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState<string | undefined>(undefined);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["public-share", token, submittedPassword],
    queryFn: async () => {
      const { data } = await axios.get(`/share/${token}`, { params: { password: submittedPassword } });
      return data as { file: { id: string; originalName: string; mimeType: string; size: number }; permission: string };
    },
    retry: false,
  });

  const needsPassword = axios.isAxiosError(error) && error.response?.data?.error?.code === "SHARE_PASSWORD_REQUIRED";
  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite-50 dark:bg-graphite-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded bg-graphite-900 dark:bg-brass-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-sans font-semibold text-2xl text-graphite-900 dark:text-graphite-50">Vault</span>
        </div>

        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-lg p-6 shadow-sm text-center">
          {isLoading && <p className="text-sm text-graphite-400">Loading…</p>}

          {notFound && (
            <p className="text-sm text-graphite-500">
              This link is invalid, disabled, or has expired.
            </p>
          )}

          {needsPassword && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmittedPassword(password);
                refetch();
              }}
              className="space-y-3 text-left"
            >
              <div className="flex items-center gap-2 justify-center text-graphite-500 mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Password required</span>
              </div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 px-3 py-2 text-sm outline-none focus:border-brass-500"
                placeholder="Enter password"
              />
              <button className="w-full rounded-md bg-graphite-900 dark:bg-brass-500 text-white text-sm font-medium py-2">
                Unlock
              </button>
            </form>
          )}

          {data && (
            <div className="space-y-4">
              <FileIcon mimeType={data.file.mimeType} className="w-10 h-10 mx-auto text-graphite-400" />
              <div>
                <p className="font-medium text-graphite-900 dark:text-graphite-50 break-words">
                  {data.file.originalName}
                </p>
                <p className="text-xs text-graphite-400 mt-1">{formatBytes(data.file.size)}</p>
              </div>

              {canPreview(data.file.mimeType) && (
                <div className="rounded-md overflow-hidden border border-graphite-200 dark:border-graphite-700">
                  {fileKind(data.file.mimeType) === "image" && (
                    <img
                      src={`/share/${token}/preview?password=${encodeURIComponent(submittedPassword ?? "")}`}
                      alt={data.file.originalName}
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {data.permission === "download" && (
                <a
                  href={`/share/${token}/download?password=${encodeURIComponent(submittedPassword ?? "")}`}
                  className="inline-flex items-center gap-2 justify-center w-full rounded-md bg-graphite-900 dark:bg-brass-500 text-white text-sm font-medium py-2.5"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
