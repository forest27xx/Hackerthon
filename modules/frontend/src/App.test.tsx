import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("lets a user choose a mood and add a menu item to the cart", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /加班/ }));
    expect(screen.getByText("人气推荐")).toBeInTheDocument();
    expect(screen.getAllByText(/今日下单目的/).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /加入/ })[0]);
    expect(screen.getByText(/钱包剩余/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下单" })).toBeInTheDocument();
  });
});
