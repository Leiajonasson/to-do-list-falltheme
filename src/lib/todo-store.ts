import { useEffect, useState, useCallback } from "react";

export type Todo = { id: string; text: string; done: boolean };
export type TodoList = { id: string; title: string; date?: string; items: Todo[] };

const KEY = "todo-lists-v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const seedItems: Record<string, string[]> = {
  inhandling: [
    "Äpple", "Banan", "Mjöl", "Mjölk", "Kakor", "Bröd", "Läsk", "Godis",
    "Smör", "Ägg", "Ost", "Kaffe", "Socker", "Ris", "Pasta", "Potatis", "Tomater", "Gurka",
  ],
  torsdag: ["Städa köket", "Tvätta", "Ring mormor", "Träna 30 min", "Läxor"],
  jul: [
    "Köp julklappar", "Skicka julkort", "Dekorera granen",
    "Baka pepparkakor", "Planera julbordet", "Ljus till adventen",
  ],
  nyar: [
    "Skicka inbjudningar", "Beställa mat", "Gör en spellista",
    "Köp dekorationer", "Planera spel för kvällen", "Boka hemkomsttaxi",
  ],
};

const seed: TodoList[] = Object.entries(seedItems).map(([id, items]) => ({
  id,
  title: id === "torsdag" ? "Onsdag 28/10" : id === "jul" ? "Fixa inför Jul" : id === "inhandling" ? "Inhandlingslista" : "Planera nyår",
  items: items.map((t) => ({ id: uid(), text: t, done: false })),
}));

function read(): TodoList[] {
  try {
    const raw = localStorage.getItem(KEY);
    const lists: TodoList[] = raw ? JSON.parse(raw) : seed;
    // One-time rename: "Torsdag 6/10" -> "Onsdag 28/10" (same date as shown under the title)
    let lists2 = lists.map((l) =>
      l.id === "torsdag" && l.title === "Torsdag 6/10" ? { ...l, title: "Onsdag 28/10" } : l,
    );
    // Add missing seed items to already-saved data (preserves existing items and their state)
    lists2 = lists2.map((l) => {
      const items = seedItems[l.id];
      if (!items) return l;
      const have = new Set(l.items.map((i) => i.text));
      const missing = items
        .filter((t) => !have.has(t))
        .map((text) => ({ id: uid(), text, done: false }));
      return missing.length ? { ...l, items: [...l.items, ...missing] } : l;
    });
    return lists2;
  } catch {
    return seed;
  }
}

const listeners = new Set<() => void>();

export function useTodoLists() {
  const [lists, setLists] = useState<TodoList[] | null>(null);
  useEffect(() => {
    const sync = () => setLists(read());
    sync();
    listeners.add(sync);
    return () => void listeners.delete(sync);
  }, []);

  const update = useCallback((fn: (l: TodoList[]) => TodoList[]) => {
    const next = fn(read());
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  }, []);

  return {
    lists,
    createList: () => {
      const id = uid();
      update((l) => [...l, { id, title: "Ny lista", items: [] }]);
      return id;
    },
    renameList: (id: string, title: string) =>
      update((l) => l.map((x) => (x.id === id ? { ...x, title } : x))),
    setDate: (id: string, date: string) =>
      update((l) =>
        l.map((x) => {
          if (x.id !== id) return x;
          const d = date.trim();
          if (!d) {
            const { date: _drop, ...rest } = x;
            return rest;
          }
          return { ...x, date: d };
        }),
      ),
    deleteList: (id: string) => update((l) => l.filter((x) => x.id !== id)),
    addItem: (id: string, text: string) =>
      update((l) =>
        l.map((x) => (x.id === id ? { ...x, items: [...x.items, { id: uid(), text, done: false }] } : x)),
      ),
    toggleItem: (id: string, itemId: string) =>
      update((l) =>
        l.map((x) =>
          x.id === id
            ? { ...x, items: x.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
            : x,
        ),
      ),
    deleteItem: (id: string, itemId: string) =>
      update((l) =>
        l.map((x) => (x.id === id ? { ...x, items: x.items.filter((i) => i.id !== itemId) } : x)),
      ),
  };
}
