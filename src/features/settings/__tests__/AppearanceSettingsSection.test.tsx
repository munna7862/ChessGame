import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsProvider } from "../SettingsContext";
import { AppearanceSettingsSection } from "../components/AppearanceSettingsSection";
import { PersistenceService } from "../../../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import { SettingsService } from "../../../domain/persistence/settings/SettingsService";
import type { BoardTheme, PieceSet } from "../../../domain/persistence/schema";

describe("AppearanceSettingsSection Component (TC-THM-08, TC-THM-09)", () => {
  let adapter: InMemoryPersistenceAdapter;
  let persistenceService: PersistenceService;
  let settingsService: SettingsService;

  beforeEach(() => {
    adapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter });
    settingsService = new SettingsService({ persistenceService });
  });

  const renderSection = () => {
    return render(
      <SettingsProvider service={settingsService}>
        <AppearanceSettingsSection />
      </SettingsProvider>
    );
  };

  const ALL_THEMES: readonly BoardTheme[] = [
    "classic",
    "wood",
    "slate",
    "ocean",
    "emerald",
    "midnight",
  ];

  const ALL_PIECE_SETS: readonly PieceSet[] = ["standard", "classic", "modern"];

  it("renders all 6 board themes with interactive radio buttons and previews", () => {
    renderSection();

    const themeGrid = screen.getByTestId("theme-selector-grid");
    expect(themeGrid).toBeInTheDocument();

    for (const theme of ALL_THEMES) {
      const option = screen.getByTestId(`theme-option-${theme}`);
      expect(option).toBeInTheDocument();
      expect(option).toHaveAttribute("role", "radio");
    }
  });

  it.each(ALL_THEMES)(
    "selects %s theme and updates settings immediately",
    (theme) => {
      renderSection();

      const option = screen.getByTestId(`theme-option-${theme}`);
      fireEvent.click(option);

      expect(settingsService.getSettings().boardTheme).toBe(theme);
      expect(option).toHaveAttribute("aria-checked", "true");
      expect(
        screen.getByTestId(`theme-badge-selected-${theme}`)
      ).toHaveTextContent("Active");
    }
  );

  it("renders all 3 piece sets with interactive radio buttons", () => {
    renderSection();

    const pieceSetGrid = screen.getByTestId("piece-set-selector-grid");
    expect(pieceSetGrid).toBeInTheDocument();

    for (const set of ALL_PIECE_SETS) {
      const option = screen.getByTestId(`piece-set-option-${set}`);
      expect(option).toBeInTheDocument();
      expect(option).toHaveAttribute("role", "radio");
    }
  });

  it.each(ALL_PIECE_SETS)(
    "selects %s piece set and updates settings immediately",
    (set) => {
      renderSection();

      const option = screen.getByTestId(`piece-set-option-${set}`);
      fireEvent.click(option);

      expect(settingsService.getSettings().pieceSet).toBe(set);
      expect(option).toHaveAttribute("aria-checked", "true");
      expect(
        screen.getByTestId(`piece-set-badge-selected-${set}`)
      ).toHaveTextContent("Active");
    }
  );
});
