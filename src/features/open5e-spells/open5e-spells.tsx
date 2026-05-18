import { Loader2, Search, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const OPEN5E_SPELLS_URL = "https://api.open5e.com/v2/spells/";
const SPELL_FIELDS = [
  "key",
  "name",
  "level",
  "school",
  "classes",
  "range_text",
  "casting_time",
  "duration",
  "concentration",
  "ritual",
  "verbal",
  "somatic",
  "material",
  "material_specified",
  "desc",
  "higher_level",
  "document",
].join(",");

interface Open5eNamedResource {
  name: string;
  key: string;
}

interface Open5eDocument {
  name: string;
  key: string;
  display_name?: string;
}

interface Open5eSpell {
  key: string;
  name: string;
  level: number;
  school: Open5eNamedResource | null;
  classes: Open5eNamedResource[];
  range_text: string;
  casting_time: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  material_specified: string;
  desc: string;
  higher_level: string;
  document: Open5eDocument | null;
}

interface Open5eSpellResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Open5eSpell[];
}

const levelLabel = (level: number): string => {
  if (level === 0) return "Cantrip";

  const suffix =
    level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
  return `${level}${suffix}-level`;
};

const componentsLabel = (spell: Open5eSpell): string => {
  const components = [
    spell.verbal ? "V" : null,
    spell.somatic ? "S" : null,
    spell.material ? "M" : null,
  ].filter(Boolean);

  if (components.length === 0) return "None";
  if (!spell.material || !spell.material_specified) return components.join(", ");
  return `${components.join(", ")} (${spell.material_specified})`;
};

const spellDescription = (spell: Open5eSpell): string[] =>
  [
    spell.desc,
    spell.higher_level ? `At Higher Levels. ${spell.higher_level}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

const buildSpellsUrl = (query: string): string => {
  const params = new URLSearchParams({
    limit: "12",
    ordering: "name",
    fields: SPELL_FIELDS,
    school__fields: "name,key",
    classes__fields: "name,key",
    document__fields: "name,key,display_name",
  });

  if (query.trim()) {
    params.set("name__icontains", query.trim());
  }

  return `${OPEN5E_SPELLS_URL}?${params.toString()}`;
};

const fetchSpells = async (
  query: string,
  signal: AbortSignal,
): Promise<Open5eSpellResponse> => {
  const response = await fetch(buildSpellsUrl(query), { signal });
  if (!response.ok) {
    throw new Error(`Open5e spells request failed (${response.status})`);
  }

  return (await response.json()) as Open5eSpellResponse;
};

export const Open5eSpells = () => {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [spells, setSpells] = useState<Open5eSpell[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchSpells(submittedQuery, controller.signal)
      .then((data) => {
        setSpells(data.results);
        setSelectedKey(data.results[0]?.key ?? null);
      })
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError(caught instanceof Error ? caught.message : String(caught));
        setSpells([]);
        setSelectedKey(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [submittedQuery]);

  const selectedSpell = useMemo(
    () => spells.find((spell) => spell.key === selectedKey) ?? spells[0] ?? null,
    [selectedKey, spells],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query);
  };

  return (
    <Card className="w-[min(1100px,92vw)] text-left">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle
              role="heading"
              aria-level={2}
              className="flex items-center gap-2 text-2xl"
            >
              <WandSparkles className="size-6 text-info" />
              Open5e Spells
            </CardTitle>
            <CardDescription>
              Search the Open5e spell API and preview spell details.
            </CardDescription>
          </div>
          <form
            className="flex w-full gap-2 md:w-[360px]"
            onSubmit={handleSearch}
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search spells"
              aria-label="Search spells"
            />
            <Button type="submit" variant="info" disabled={isLoading}>
              <Search className="size-4" />
              Search
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="rounded-md bg-warning/80 p-3 font-semibold text-destructive">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="flex max-h-[640px] flex-col gap-2 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-lg border p-4 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading spells...
              </div>
            ) : null}
            {!isLoading && spells.length === 0 && !error ? (
              <p className="rounded-lg border p-4 text-muted-foreground">
                No spells found.
              </p>
            ) : null}
            {spells.map((spell) => (
              <button
                key={spell.key}
                type="button"
                onClick={() => setSelectedKey(spell.key)}
                className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-pressed={selectedSpell?.key === spell.key}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{spell.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {levelLabel(spell.level)}
                      {spell.school ? ` ${spell.school.name}` : ""}
                    </p>
                  </div>
                  {spell.ritual ? (
                    <Badge variant="outline">Ritual</Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{spell.casting_time}</span>
                  <span>{spell.range_text}</span>
                  <span>{spell.duration}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="min-h-[420px] rounded-lg border p-5">
            {selectedSpell ? (
              <article className="flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold">
                      {selectedSpell.name}
                    </h3>
                    <Badge>{levelLabel(selectedSpell.level)}</Badge>
                    {selectedSpell.school ? (
                      <Badge variant="secondary">
                        {selectedSpell.school.name}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Source:{" "}
                    {selectedSpell.document?.display_name ??
                      selectedSpell.document?.name ??
                      "Open5e"}
                  </p>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">Casting Time</dt>
                    <dd className="text-muted-foreground">
                      {selectedSpell.casting_time}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Range</dt>
                    <dd className="text-muted-foreground">
                      {selectedSpell.range_text}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Components</dt>
                    <dd className="text-muted-foreground">
                      {componentsLabel(selectedSpell)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Duration</dt>
                    <dd className="text-muted-foreground">
                      {selectedSpell.concentration ? "Concentration, " : ""}
                      {selectedSpell.duration}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold">Classes</dt>
                    <dd className="text-muted-foreground">
                      {selectedSpell.classes.length > 0
                        ? selectedSpell.classes
                            .map((spellClass) => spellClass.name)
                            .join(", ")
                        : "None listed"}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-3">
                  {spellDescription(selectedSpell).map((line, index) => (
                    <p key={`${selectedSpell.key}-${index}`}>{line}</p>
                  ))}
                </div>
              </article>
            ) : (
              <p className="text-muted-foreground">
                Select a spell to view details.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
