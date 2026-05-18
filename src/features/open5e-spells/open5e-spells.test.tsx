import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Open5eSpells } from "@/features/open5e-spells/open5e-spells";

const spellResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      key: "srd_mage-hand",
      name: "Mage Hand",
      level: 0,
      school: { name: "Conjuration", key: "conjuration" },
      classes: [{ name: "Wizard", key: "wizard" }],
      range_text: "30 feet",
      casting_time: "action",
      duration: "1 minute",
      concentration: false,
      ritual: false,
      verbal: true,
      somatic: true,
      material: false,
      material_specified: "",
      desc: "A spectral, floating hand appears at a point you choose within range.",
      higher_level: "",
      document: {
        name: "Systems Reference Document",
        key: "srd",
        display_name: "SRD",
      },
    },
  ],
};

describe("Open5eSpells", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => spellResponse,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and renders Open5e spells in a list and detail layout", async () => {
    render(<Open5eSpells />);

    expect(screen.getByRole("heading", { name: /open5e spells/i })).toBeInTheDocument();

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://api.open5e.com/v2/spells/"),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );

    await userEvent.click(await screen.findByRole("button", { name: /mage hand/i }));

    expect(screen.getByText("Cantrip")).toBeInTheDocument();
    expect(screen.getAllByText("Conjuration")[0]).toBeInTheDocument();
    expect(screen.getByText(/a spectral, floating hand/i)).toBeInTheDocument();
    expect(screen.getByText("V, S")).toBeInTheDocument();
    expect(screen.getByText(/source/i)).toHaveTextContent("SRD");
  });
});
