import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationProvider } from "@storyteller/common";
import { ProviderBillingModal } from "./provider-billing-modal";

// Boundary isolation: this component receives events from the host. The
// Tauri subscription contract is not executable in jsdom, so simulate only
// the incoming host event; leave the component state transitions real.
const host = vi.hoisted(() => ({
  receive: null as null | ((event: { provider: any }) => Promise<void>),
}));

vi.mock("@storyteller/tauri-events", () => ({
  useShowProviderBillingModalEvent: (handler: typeof host.receive) => {
    host.receive = handler;
  },
}));

vi.mock("@storyteller/ui-modal", () => ({
  Modal: ({ isOpen, onClose, children }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => isOpen
    ? <div role="dialog">{children}<button onClick={onClose}>Close billing</button></div>
    : null,
}));
vi.mock("./artcraft/ArtcraftBillingBlock", () => ({
  ArtcraftBillingBlock: () => <div>Artcraft billing</div>,
}));
vi.mock("./others/GenericProviderBillingBlock", () => ({
  GenericProviderBillingBlock: () => <div>External provider billing</div>,
}));

beforeEach(() => {
  host.receive = null;
});

describe("ProviderBillingModal", () => {
  it("stays hidden until a native provider event is received", () => {
    render(<ProviderBillingModal />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(host.receive).toBeTypeOf("function");
  });

  it("opens the matching billing content and closes on request", async () => {
    render(<ProviderBillingModal />);
    await act(async () => {
      await host.receive!({ provider: GenerationProvider.Fal });
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("External provider billing")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close billing" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("routes the Artcraft provider to its own billing block", async () => {
    render(<ProviderBillingModal isVideoPage />);
    await act(async () => {
      await host.receive!({ provider: GenerationProvider.Artcraft });
    });
    expect(screen.getByText("Artcraft billing")).toBeTruthy();
    expect(screen.queryByText("External provider billing")).toBeNull();
  });
});
