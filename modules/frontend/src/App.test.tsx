import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lets a user choose a mood and add a menu item to the cart", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /开始游戏/ }));
    expect(screen.getByRole("button", { name: /关闭声音/ })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /加班/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /加班/ }));
    expect(await screen.findByText("人气推荐")).toBeInTheDocument();
    expect(screen.getAllByText(/今日下单目的/).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /一键添加/ })[0]);
    expect(screen.getByText(/钱包剩余/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下单" })).toBeInTheDocument();
  });

  it("lets a user toggle the global sound switch after audio is initialized", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /开始游戏/ }));
    await user.click(screen.getByRole("button", { name: /关闭声音/ }));

    expect(screen.getByRole("button", { name: /开启声音/ })).toBeInTheDocument();
  });

  it("plays the payment and refresh transition before order progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /开始游戏/ }));
    expect(await screen.findByRole("button", { name: /加班/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /加班/ }));
    await user.click((await screen.findAllByRole("button", { name: /一键添加/ }))[0]);
    await user.click(screen.getByRole("button", { name: "下单" }));

    expect(screen.getByText("Face ID 验证中")).toBeInTheDocument();
    expect(await screen.findByText("支付成功", {}, { timeout: 1400 })).toBeInTheDocument();
    expect(await screen.findByText("订单页加载中", {}, { timeout: 1800 })).toBeInTheDocument();
    expect(await screen.findByText("订单进行中", {}, { timeout: 2600 })).toBeInTheDocument();
  }, 8000);

  it("shows an insufficient balance prompt without entering order progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /开始游戏/ }));
    expect(await screen.findByRole("button", { name: /加班/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /加班/ }));
    const addPreset = (await screen.findAllByRole("button", { name: /一键添加/ }))[0];
    await user.click(addPreset);
    await user.click(addPreset);
    await user.click(addPreset);
    await user.click(addPreset);

    await user.click(screen.getByRole("button", { name: "余额不足" }));

    expect(screen.getAllByText("余额不足").length).toBeGreaterThan(0);
    expect(screen.getByText(/钱包差 ¥/)).toBeInTheDocument();
    expect(screen.queryByText("订单进行中")).not.toBeInTheDocument();
  });
});
