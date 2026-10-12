import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listen } from "@tauri-apps/api/event";
import { GenerationProvider } from "@storyteller/common";
import { useShowProviderBillingModalEvent } from "./ShowProviderBillingModalEvent";

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(),
}));

const nativeListen = vi.mocked(listen);

beforeEach(() => {
  nativeListen.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useShowProviderBillingModalEvent", () => {
  it("dispatches native events to the latest callback and unsubscribes on unmount", async () => {
    const unlisten = vi.fn();
    const oldHandler = vi.fn(async () => {});
    const newHandler = vi.fn(async () => {});
    nativeListen.mockResolvedValue(unlisten);

    const hook = renderHook(
      ({ onEvent }) => useShowProviderBillingModalEvent(onEvent),
      { initialProps: { onEvent: oldHandler } },
    );

    await waitFor(() => expect(nativeListen).toHaveBeenCalledOnce());
    hook.rerender({ onEvent: newHandler });
    const listener = nativeListen.mock.calls[0][1]!;
    await act(async () => {
      listener({
        payload: { data: { provider: GenerationProvider.Fal } },
      } as Parameters<typeof listener>[0]);
    });

    await waitFor(() => expect(newHandler).toHaveBeenCalledOnce());
    expect(oldHandler).not.toHaveBeenCalled();
    expect(nativeListen).toHaveBeenCalledTimes(1);
    hook.unmount();
    expect(unlisten).toHaveBeenCalledOnce();
  });

  it("unsubscribes if native registration resolves after React unmounts", async () => {
    const unlisten = vi.fn();
    let finish: ((value: typeof unlisten) => void) | undefined;
    nativeListen.mockImplementation(() => new Promise((resolve) => {
      finish = resolve;
    }));
    const hook = renderHook(() => useShowProviderBillingModalEvent(async () => {}));
    hook.unmount();
    await act(async () => {
      finish!(unlisten);
    });
    await waitFor(() => expect(unlisten).toHaveBeenCalledOnce());
  });

  it("captures rejected native registration without leaking an unhandled promise", async () => {
    const nativeError = new Error("native event API unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    nativeListen.mockRejectedValue(nativeError);
    renderHook(() => useShowProviderBillingModalEvent(async () => {}));
    await waitFor(() => {
      expect(log).toHaveBeenCalledWith(
        "[artcraft] Failed to subscribe to billing events",
        nativeError,
      );
    });
  });

  it("captures asynchronous errors from the event callback", async () => {
    const unlisten = vi.fn();
    const callbackError = new Error("billing view failed");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    nativeListen.mockResolvedValue(unlisten);

    const hook = renderHook(() => useShowProviderBillingModalEvent(async () => {
      throw callbackError;
    }));
    await waitFor(() => expect(nativeListen).toHaveBeenCalledOnce());

    const listener = nativeListen.mock.calls[0][1]!;
    await act(async () => {
      listener({ payload: { data: { provider: GenerationProvider.Artcraft } } } as Parameters<typeof listener>[0]);
    });
    await waitFor(() => expect(log).toHaveBeenCalledWith(
      "[artcraft] Billing event callback failed",
      callbackError,
    ));
    hook.unmount();
    expect(unlisten).toHaveBeenCalledOnce();
  });
});
