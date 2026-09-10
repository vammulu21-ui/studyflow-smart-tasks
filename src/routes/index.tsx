import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Sigma, Check, Hourglass, Trash2, Undo2 } from "lucide-react";
import avatarImg from "../assets/avatar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyFlow – Smart Student Task Manager" },
      {
        name: "description",
        content:
          "StudyFlow helps students plan their day: track total, completed and pending study tasks, add tasks by subject, priority and due date, and stay motivated.",
      },
      {
        property: "og:title",
        content: "StudyFlow – Smart Student Task Manager",
      },
      {
        property: "og:description",
        content:
          "A clean, colorful task manager for students: priority-coded tasks, due dates, progress stats and daily motivation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Priority = "High" | "Medium" | "Low";

interface Task {
  id: string;
  name: string;
  subject: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
}

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

const priorityStyles: Record<Priority, string> = {
  High: "bg-priority-high/15 text-priority-high",
  Medium: "bg-priority-med/15 text-priority-med",
  Low: "bg-priority-low/15 text-priority-low",
};

const priorityRing: Record<Priority, string> = {
  High: "ring-2 ring-priority-high/60 bg-priority-high/15",
  Medium: "ring-2 ring-priority-med/60 bg-priority-med/15",
  Low: "ring-2 ring-priority-low/60 bg-priority-low/15",
};

const QUOTES: { text: string; author: string }[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Small sessions, done daily, beat heroic all-nighters.",
    author: "StudyFlow",
  },
  {
    text: "Focus is a habit, not a mood.",
    author: "StudyFlow",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
];

const seedTasks: Task[] = [
  {
    id: "t1",
    name: "Physics: Wave Optics",
    subject: "Physics",
    priority: "High",
    dueDate: "2026-09-12",
    completed: false,
  },
  {
    id: "t2",
    name: "Chemistry Lab Report",
    subject: "Chemistry",
    priority: "Medium",
    dueDate: "2026-09-14",
    completed: false,
  },
  {
    id: "t3",
    name: "History: Essay Outline",
    subject: "History",
    priority: "Low",
    dueDate: "2026-09-16",
    completed: false,
  },
  {
    id: "t4",
    name: "Math: Integral Practice",
    subject: "Math",
    priority: "Medium",
    dueDate: "2026-09-10",
    completed: true,
  },
];

function formatDue(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function loadTasks(): Task[] {
  if (typeof window === "undefined") return seedTasks;
  try {
    const raw = window.localStorage.getItem("studyflow-tasks");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Task[];
    }
  } catch {
    /* ignore */
  }
  return seedTasks;
}

function Index() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem("studyflow-tasks", JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks]);

  useEffect(() => {
    const t = window.setInterval(
      () => setQuoteIndex((i) => (i + 1) % QUOTES.length),
      6000,
    );
    return () => window.clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - completed;
    const pct = tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0;
    const dueToday = tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        new Date(t.dueDate + "T23:59:59") <= new Date(Date.now() + 86400000),
    ).length;
    return { total: tasks.length, completed, pending, pct, dueToday };
  }, [tasks]);

  const sorted = useMemo(() => {
    const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (order[a.priority] !== order[b.priority])
        return order[a.priority] - order[b.priority];
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        subject: subject.trim(),
        priority,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        completed: false,
      },
    ]);
    setName("");
    setSubject("");
    setPriority("Medium");
    setDueDate("");
  };

  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const quote = QUOTES[quoteIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-ink antialiased">
      {/* Aurora background */}
      <div className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full blob-indigo blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[560px] rounded-full blob-fuchsia blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-[480px] rounded-full blob-cyan blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {/* Header */}
        <header className="cf flex items-center justify-between rounded-2xl px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-brand font-display text-lg font-extrabold text-primary-foreground shadow-lg shadow-brand/30">
              S
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg leading-none font-bold">
                StudyFlow
              </div>
              <div className="mt-1 text-xs tracking-wide text-ink-soft">
                Smart Student Task Manager
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <div className="text-xs text-ink-soft">Keep it up,</div>
              <div className="text-sm font-semibold">Maya Chen</div>
            </div>
            <img
              src={avatarImg}
              alt="Maya Chen"
              loading="lazy"
              width={512}
              height={512}
              className="size-11 rounded-full object-cover outline-1 -outline-offset-1 outline-ink/5"
            />
          </div>
        </header>

        {/* Stats */}
        <section
          aria-label="Task overview"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="cf animate-rise rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-brand/15 text-brand">
                <Sigma className="size-5" aria-hidden />
              </div>
              <div className="text-sm font-medium text-ink-soft">
                Total Tasks
              </div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold">
              {stats.total}
            </div>
            <div className="mt-1 text-xs text-ink-soft">Active this week</div>
          </div>
          <div className="cf animate-rise rounded-2xl p-5 [animation-delay:80ms]">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-priority-low/15 text-priority-low">
                <Check className="size-5" aria-hidden />
              </div>
              <div className="text-sm font-medium text-ink-soft">Completed</div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold text-priority-low">
              {stats.completed}
            </div>
            <div className="mt-1 text-xs text-ink-soft">
              {stats.pct}% done
            </div>
          </div>
          <div className="cf animate-rise rounded-2xl p-5 [animation-delay:160ms]">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-priority-med/15 text-priority-med">
                <Hourglass className="size-5" aria-hidden />
              </div>
              <div className="text-sm font-medium text-ink-soft">Pending</div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold text-priority-med">
              {stats.pending}
            </div>
            <div className="mt-1 text-xs text-ink-soft">
              {stats.dueToday} due soon
            </div>
          </div>
        </section>

        {/* Form + quote */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <form
              onSubmit={addTask}
              className="cf animate-rise rounded-2xl p-6 [animation-delay:240ms]"
            >
              <h2 className="font-display text-lg font-bold">New Task</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="task-name"
                    className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
                  >
                    Task Name
                  </label>
                  <input
                    id="task-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Revise calculus chapter 4"
                    className="mt-1.5 w-full rounded-xl border border-card/70 bg-card/70 px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:ring-2 focus:ring-brand/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-subject"
                    className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
                  >
                    Subject
                  </label>
                  <input
                    id="task-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="mt-1.5 w-full rounded-xl border border-card/70 bg-card/70 px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:ring-2 focus:ring-brand/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-due"
                    className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
                  >
                    Due Date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-card/70 bg-card/70 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                    Priority
                  </span>
                  <div
                    className="mt-1.5 grid grid-cols-3 gap-2"
                    role="radiogroup"
                    aria-label="Priority"
                  >
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={priority === p}
                        onClick={() => setPriority(p)}
                        className={`rounded-xl py-3 text-sm font-semibold transition ${priorityStyles[p]} ${
                          priority === p ? priorityRing[p] : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3.5 font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110 active:translate-y-px"
              >
                <Plus className="size-4" aria-hidden />
                Add Task
              </button>
            </form>
          </section>

          <section
            aria-label="Daily motivation"
            className="flex min-h-[220px] animate-rise flex-col justify-between rounded-2xl gradient-hero p-6 text-primary-foreground shadow-xl shadow-brand/30 [animation-delay:320ms]"
          >
            <div className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
              Daily Motivation
            </div>
            <blockquote key={quoteIndex} className="animate-quote">
              <p className="mt-4 font-display text-2xl leading-snug font-bold">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-5 text-sm opacity-85">
                — {quote.author}
              </footer>
            </blockquote>
          </section>
        </div>

        {/* Tasks */}
        <section className="mt-8 animate-rise [animation-delay:400ms]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Your Tasks</h2>
            <span className="text-xs text-ink-soft">
              {stats.pending} pending
            </span>
          </div>
          {tasks.length === 0 ? (
            <div className="cf rounded-2xl p-10 text-center text-sm text-ink-soft">
              No tasks yet — add your first one above and get flowing.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((task) => (
                <article
                  key={task.id}
                  className={`cf rounded-2xl p-5 transition hover:-translate-y-0.5 ${
                    task.completed ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        task.completed
                          ? priorityStyles.Low
                          : priorityStyles[task.priority]
                      }`}
                    >
                      {task.completed ? "Completed" : task.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.name}`}
                      className="grid size-7 place-items-center rounded-full bg-priority-high/15 text-priority-high transition hover:bg-priority-high/25"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <h3
                    className={`mt-3 font-display text-lg leading-snug font-semibold ${
                      task.completed ? "text-ink-soft line-through" : ""
                    }`}
                  >
                    {task.name}
                  </h3>
                  <div
                    className={`mt-1 text-sm text-ink-soft ${task.completed ? "line-through" : ""}`}
                  >
                    {task.subject}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        task.completed
                          ? "font-medium text-priority-low"
                          : "text-ink-soft"
                      }`}
                    >
                      {task.completed ? "Done" : formatDue(task.dueDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                        task.completed
                          ? "text-ink-soft/60 hover:text-ink-soft"
                          : "text-priority-low hover:brightness-90"
                      }`}
                    >
                      {task.completed ? (
                        <>
                          <Undo2 className="size-3.5" aria-hidden /> Restore
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" aria-hidden /> Mark done
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
