import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SPACE_TYPES } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SPACE_TYPE_LABELS } from "@/types/domain";

/**
 * The home page's way into the catalogue: pick a city and a kind of space,
 * land on /lieux already filtered. A plain GET form — the browser builds
 * `/lieux?ville=Lyon&type=salle-reunion` itself and the page reads it from
 * `searchParams`, so this needs no JavaScript and no Server Action. An empty
 * choice sends an empty value, which the page treats as "no filter".
 */
export function SearchForm({
  cities,
  t,
}: {
  cities: string[];
  t: Dictionary["site"]["search"];
}) {
  return (
    <form
      action="/lieux"
      method="get"
      className="grid gap-3 rounded-sm border border-line bg-surface p-4 shadow-sm shadow-ink/5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="search-city">{t.city}</Label>
        <Select id="search-city" name="ville" defaultValue="">
          <option value="">{t.allCities}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="search-type">{t.type}</Label>
        <Select id="search-type" name="type" defaultValue="">
          <option value="">{t.allTypes}</option>
          {SPACE_TYPES.map((type) => (
            <option key={type} value={type}>
              {SPACE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">
        <Search className="h-4 w-4" strokeWidth={1.75} />
        {t.submit}
      </Button>
    </form>
  );
}
