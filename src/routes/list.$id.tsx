import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useTodoLists } from "@/lib/todo-store";
import leavesLeft from "@/assets/leaves-left.png.asset.json";
import leavesRight from "@/assets/leaves-right.png.asset.json";

export const Route = createFileRoute("/list/$id")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } =>
    s["new"] === true || s["new"] === "true" ? { new: true } : {},
  head: () => ({
    meta: [
      { title: "To-do lista" },
      { name: "description", content: "Bocka av och lägg till saker i din to-do lista." },
      { property: "og:title", content: "To-do lista" },
      { property: "og:description", content: "Bocka av och lägg till saker i din to-do lista." },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const { id } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const { lists, renameList, addItem, toggleItem, deleteItem } = useTodoLists();
  const [draft, setDraft] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const list = lists?.find((l) => l.id === id);

  const submit = () => {
    if (draft?.trim()) addItem(id, draft.trim());
    setDraft(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-10">
      <img src={leavesLeft.url} alt="" className="pointer-events-none absolute left-[max(1rem,calc(50%-30rem))] top-40 w-24 sm:top-44 sm:w-32 md:top-48 md:w-72" />
      <img src={leavesRight.url} alt="" className="pointer-events-none absolute right-[max(1rem,calc(50%-30rem))] top-36 w-24 sm:top-40 sm:w-32 md:top-44 md:w-72" />
      <Link to="/" aria-label="Tillbaka" className="absolute left-10 top-20 text-foreground">
        <ChevronLeft className="h-14 w-14" strokeWidth={1.5} />
      </Link>
      <h1 className="pt-20 text-center font-display text-6xl text-foreground">
        {isNew ? "Skapa din nya to-do" : "To-do"}
      </h1>
      {lists && !list && <p className="mt-10 text-center text-foreground">Listan hittades inte.</p>}
      {list && (
        <section className="relative mx-auto mt-14 max-w-md rounded-md bg-card px-6 pb-6 pt-5 shadow-card">
          <div className="flex items-center justify-between">
            <input
              value={list.title}
              onChange={(e) => renameList(id, e.target.value)}
              className="w-full bg-transparent font-display text-2xl text-card-foreground outline-none"
              aria-label="Listans namn"
            />
            <button onClick={() => setDraft("")} aria-label="Lägg till" className="text-card-foreground">
              <Plus className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
          <ul className="mt-2 max-h-[420px] overflow-y-auto">
            {list.items.map((item) => (
              <li key={item.id} className="group relative flex items-center gap-3">
                <div className="flex flex-1 items-center gap-6 border-b border-card-foreground/70 py-3">
                  <button
                    onClick={() => toggleItem(id, item.id)}
                    aria-label={item.done ? "Ångra" : "Klar"}
                    className={`ml-2 h-7 w-7 shrink-0 rounded-full border-2 border-card-foreground transition ${item.done ? "border-[1px] bg-done" : ""}`}
                  />
                  <button
                    onClick={() => setSelected(selected === item.id ? null : item.id)}
                    className={`min-w-0 flex-1 truncate text-left font-display text-lg text-card-foreground ${selected === item.id ? "pr-24" : ""}`}
                  >
                    {item.text}
                  </button>
                  {selected !== item.id && (
                    <button
                      onClick={() => setSelected(item.id)}
                      aria-label="Visa radera"
                      className="pr-2 font-display text-2xl leading-none text-card-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      &minus;
                    </button>
                  )}
                </div>
                {selected === item.id && (
                  <button
                    onClick={() => {
                      deleteItem(id, item.id);
                      setSelected(null);
                    }}
                    className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-md bg-destructive px-4 py-1.5 font-display text-base text-destructive-foreground shadow-card transition hover:ring-2 hover:ring-foreground"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
            {draft !== null && (
              <li className="flex items-center gap-6 border-b border-card-foreground/70 py-3">
                <span className="ml-2 h-7 w-7 shrink-0 rounded-full border-2 border-card-foreground" />
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  onBlur={submit}
                  placeholder="Ny sak…"
                  className="flex-1 bg-transparent font-display text-lg text-card-foreground outline-none placeholder:text-muted-foreground"
                />
              </li>
            )}
          </ul>
        </section>
      )}
    </main>
  );
}
