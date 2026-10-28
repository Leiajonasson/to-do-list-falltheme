import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Archive, ArchiveRestore, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTodoLists } from "@/lib/todo-store";
import birds from "@/assets/birds.png.asset.json";
import trees from "@/assets/trees.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Välkommen – Dina to-do listor" },
      { name: "description", content: "Skapa och hantera dina to-do listor." },
      { property: "og:title", content: "Välkommen – Dina to-do listor" },
      { property: "og:description", content: "Skapa och hantera dina to-do listor." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lists, createList, archiveList, restoreList } = useTodoLists();
  const [armed, setArmed] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-10">
      <img src={birds.url} alt="" className="pointer-events-none absolute left-0 top-56 hidden w-64 md:block" />
      <img src={trees.url} alt="" className="pointer-events-none absolute -right-4 top-24 hidden w-96 lg:block" />
      <h1 className="pt-14 text-center font-display text-6xl text-foreground">Välkommen!</h1>
      <section className="relative mx-auto mt-10 max-w-xl rounded-md bg-primary p-3 shadow-card">
        <div className="flex items-center justify-between px-2 py-3">
          <h2 className="font-display text-3xl text-primary-foreground">Dina listor</h2>
          <button
            onClick={() => navigate({ to: "/list/$id", params: { id: createList() }, search: { new: true } })}
            className="flex items-center gap-3 rounded-full bg-card px-6 py-2 font-display text-card-foreground transition hover:opacity-90"
          >
            Skapa <Plus className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-2 max-h-[440px] space-y-9 overflow-y-auto pb-1">
          {lists?.filter((l) => !l.archived).map((l) => (
            <li key={l.id} className="group relative">
              <Link
                to="/list/$id"
                params={{ id: l.id }}
                onClick={() => setArmed(null)}
                className="flex items-center justify-between rounded-sm bg-card px-7 py-7 font-display text-2xl text-card-foreground transition hover:bg-secondary"
              >
                {l.title}
                <ChevronRight className="h-7 w-7" />
              </Link>
              {armed === l.id ? (
                <button
                  onClick={() => {
                    archiveList(l.id);
                    setArmed(null);
                  }}
                  aria-label="Arkivera lista"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-md bg-card px-4 py-1.5 font-display text-base text-card-foreground shadow-card transition hover:ring-2 hover:ring-foreground"
                >
                  Arkivera
                </button>
              ) : (
                <button
                  onClick={() => setArmed(l.id)}
                  aria-label="Arkivera lista"
                  className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-card-foreground/70 opacity-0 transition-opacity hover:bg-beige hover:text-card-foreground focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Archive className="h-6 w-6" strokeWidth={1.5} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <button
        onClick={() => setArchiveOpen((o) => !o)}
        aria-expanded={archiveOpen}
        className="mx-auto mt-8 flex items-center gap-2.5 rounded-full bg-card/70 px-5 py-2.5 font-display text-lg text-card-foreground/80 shadow-card transition hover:bg-card"
      >
        <Archive className="h-5 w-5" strokeWidth={1.5} />
        Arkiverade listor
        <ChevronRight
          className={`h-5 w-5 text-card-foreground/60 transition-transform ${archiveOpen ? "rotate-90" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      {archiveOpen && (
        <section className="mx-auto mt-6 max-w-xl">
          {lists?.some((l) => l.archived) ? (
            <ul className="space-y-4">
              {lists
                .filter((l) => l.archived)
                .map((l) => (
                  <li key={l.id} className="group flex items-center justify-between rounded-sm bg-card/70 px-5 py-4">
                    <Link
                      to="/list/$id"
                      params={{ id: l.id }}
                      className="min-w-0 flex-1 truncate font-display text-lg text-card-foreground/80"
                    >
                      {l.title}
                    </Link>
                    <button
                      onClick={() => restoreList(l.id)}
                      aria-label="Återställ lista"
                      className="flex items-center gap-2 rounded-full p-1.5 font-display text-sm text-card-foreground/70 transition hover:bg-beige hover:text-card-foreground"
                    >
                      Återställ <ArchiveRestore className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-center font-display text-lg text-foreground">Inga arkiverade listor</p>
          )}
        </section>
      )}
    </main>
  );
}
