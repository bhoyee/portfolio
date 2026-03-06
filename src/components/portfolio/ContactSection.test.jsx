import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ContactSection from "./ContactSection";

vi.mock("@/api/contactApi", () => ({
  submitContactMessage: vi.fn(),
}));

import { submitContactMessage } from "@/api/contactApi";

const renderContact = () =>
  render(
    <MemoryRouter>
      <ContactSection />
    </MemoryRouter>
  );

describe("ContactSection", () => {
  it("shows success feedback after a successful submission", async () => {
    submitContactMessage.mockReset();
    submitContactMessage.mockResolvedValueOnce({ ok: true, mail_sent: true });

    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText("Your name"), "Salisu");
    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Tell me about your project..."), "Hello there");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/message sent successfully/i)).toBeInTheDocument();
    expect(submitContactMessage).toHaveBeenCalledTimes(1);
  });

  it("shows error feedback when the request fails", async () => {
    submitContactMessage.mockReset();
    submitContactMessage.mockRejectedValueOnce(new Error("Contact request failed (500)"));

    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText("Your name"), "Salisu");
    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Tell me about your project..."), "Hello there");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/contact request failed/i)).toBeInTheDocument();
    expect(submitContactMessage).toHaveBeenCalledTimes(1);
  });
});
