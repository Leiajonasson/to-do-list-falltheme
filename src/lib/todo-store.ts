import { useEffect, useState, useCallback } from "react";

export type Todo = { id: string; text: string; done: boolean };
export type TodoList = { id: string; title: string; items: Todo[] };

const KEY = "todo-lists-v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const inhandlingItems = [
  "Äpple", "Banan", "Mjöl", "Mjölk", "Kakor", "Bröd", "Läsk", "Godis",
  "Smör", "Ägg", "Ost", "Kaffe", "Socker", "Ris", "Pasta", "Potatis", "Tomater", "Gurka",
];

const seed: TodoList[] = [
  { id: "torsdag", title: "Onsdag 28/10", items: [] },
  { id: "jul", title: "Fixa inför Jul", items: [] },
  {
    id: "inhandling",
    title: "Inhandlingslista",
    items: inhandlingItems.map((t) => ({
      id: uid(),
      text: t,
      done: false,
    })),
  },
  { id: "nyar", title: "Planera nyår", items: [] },
];

function read(): TodoList[] {
  try {
    const raw = localStorage.getItem(KEY);
    const lists: TodoList[] = raw ? JSON.parse(raw) : seed;
    // One-time rename: "Torsdag 6/10" -> "Onsdag 28/10" (same date as shown under the title)
    return lists.map((l) => (l.id === "torsdag" && l.title === "Torsdag 6/10" ? { ...l, title: "Onsdag 28/10" } : l));
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
