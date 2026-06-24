import toast from "react-hot-toast";
import { HttpStatus } from "@repo/dto";

type ErrorHandle = Error & { status?: number; data?: unknown };

export type HandlerOptions = {
  silentStatuses?: number[];
  forceToast?: boolean;
};

export const defaultSilent = [HttpStatus.UNAUTHORIZED];

export function handleFrontendError(err: unknown, opts?: HandlerOptions) {
  const { silentStatuses = defaultSilent, forceToast } = opts || {};

  if (!err) return;

  const e = err as ErrorHandle;
  const status = e.status;
  const message = e?.message || "An error occurred";

  const isSilent = status !== undefined && silentStatuses.includes(status);

  if (forceToast) {
    toast.error(message);
    return;
  }

  if (isSilent) {
    return;
  }

  toast.error(message);
}

export default handleFrontendError;
