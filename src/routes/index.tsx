import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
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
  const { lists, createList } = useTodoLists();
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
          {lists?.map((l) => (
            <li key={l.id}>
              <Link
                to="/list/$id"
                params={{ id: l.id }}
                className="flex items-center justify-between rounded-sm bg-card px-7 py-7 font-display text-2xl text-card-foreground transition hover:bg-secondary"
              >
                {l.title}
                <ChevronRight className="h-7 w-7" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
