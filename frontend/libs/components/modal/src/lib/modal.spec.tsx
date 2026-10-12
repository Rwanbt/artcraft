import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("does not expose a dialog while closed", () => {
    render(
      <Modal isOpen={false} title="Draft" onClose={vi.fn()}>
        <p>Unsaved changes</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
