import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import type { BasicEventWrapper } from "../../common/BasicEventWrapper";
import type { GenerationProvider } from "@storyteller/common";

const EVENT_NAME = "show_provider_billing_modal_event";

export interface ShowProviderBillingModalEvent {
  provider: GenerationProvider;
}

export const useShowProviderBillingModalEvent = (
  asyncCallback: (event: ShowProviderBillingModalEvent) => Promise<void>,
) => {
  // The host callback changes on React rerenders, but the native subscription
  // must stay stable. Always dispatch to the latest callback.
  const callbackRef = useRef(asyncCallback);
  callbackRef.current = asyncCallback;

  useEffect(() => {
    let disposed = false;
    let removeListener: UnlistenFn | undefined;

    const unsubscribeSafely = (unlisten: UnlistenFn) => {
      try {
        unlisten();
      } catch (error) {
        console.error("[artcraft] Failed to unsubscribe from billing events", error);
      }
    };

    const subscribe = async () => {
      try {
        const unlisten = await listen<BasicEventWrapper<ShowProviderBillingModalEvent>>(
          EVENT_NAME,
          (wrappedEvent) => {
            void Promise.resolve()
              .then(() => callbackRef.current(wrappedEvent.payload.data))
              .catch((error) => {
                console.error("[artcraft] Billing event callback failed", error);
              });
          },
        );

        if (disposed) {
          // Native registration may complete after React has unmounted.
          unsubscribeSafely(unlisten);
        } else {
          removeListener = unlisten;
        }
      } catch (error) {
        // No unhandled rejection if the native event API is unavailable.
        console.error("[artcraft] Failed to subscribe to billing events", error);
      }
    };

    void subscribe();

    return () => {
      disposed = true;
      if (removeListener) {
        unsubscribeSafely(removeListener);
        removeListener = undefined;
      }
    };
  }, []);
};
