import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
	DropdownMenu,
	DropdownMenuContent,
} from "@app/components/ui/dropdown-menu";
import { LOCALE } from "../locale.ts";
import { localeSet, localeStore } from "../locale-store.ts";
import { LanguageSwitcher } from "../components/language-switcher.tsx";

describe("LanguageSwitcher", () => {
	beforeEach(() => {
		localeSet(LOCALE.EN);
	});

	it("renders compact variant and toggles locale when clicked", () => {
		render(<LanguageSwitcher variant="compact" />);
		const button = screen.getByRole("button");
		expect(button).toBeDefined();
		expect(screen.getByText("EN")).toBeDefined();

		fireEvent.click(button);
		expect(localeStore.state).toBe(LOCALE.ID);
		expect(screen.getByText("ID")).toBeDefined();
	});

	it("renders menu-item variant within dropdown menu and toggles locale", () => {
		render(
			<DropdownMenu open>
				<DropdownMenuContent>
					<LanguageSwitcher variant="menu-item" />
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		expect(screen.getByText("Language")).toBeDefined();
		expect(screen.getByText("EN")).toBeDefined();

		const item = screen.getByText("Language").closest('[role="menuitem"]');
		if (!item) throw new Error("Item not found");
		fireEvent.click(item);
		expect(localeStore.state).toBe(LOCALE.ID);
	});

	it("renders header variant with dropdown", async () => {
		render(<LanguageSwitcher variant="header" />);
		const trigger = screen.getByRole("button", { name: "Select Language" });
		expect(trigger).toBeDefined();
		expect(screen.getByText("EN")).toBeDefined();

		fireEvent.pointerDown(trigger);
		fireEvent.click(trigger);

		const idOption = await screen.findByText("Bahasa Indonesia");
		expect(idOption).toBeDefined();

		fireEvent.click(idOption);
		expect(localeStore.state).toBe(LOCALE.ID);
	});
});
