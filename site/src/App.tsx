import { Check, Download } from "lucide-react";

import { content } from "./content";

const base = import.meta.env.BASE_URL;
const storeUrl = `https://chromewebstore.google.com/detail/${content.id}`;

const navLink =
  "font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground";

function StoreButton() {
  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:w-auto"
    >
      <Download className="size-4" strokeWidth={2} aria-hidden="true" />
      Add to Chrome
    </a>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a
            href={base}
            className="flex items-center gap-3 font-serif text-lg font-semibold tracking-tight"
          >
            <img
              src={`${base}logo.svg`}
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-sm"
            />
            {content.shortName}
          </a>
          <nav className="flex items-center gap-6" aria-label="Links">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className={navLink}
            >
              Web Store
            </a>
            <a
              href={content.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={navLink}
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <span className="inline-block rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-primary">
              Chrome Extension
            </span>
            <h1 className="mt-5 text-balance font-serif text-5xl leading-none tracking-tight md:text-6xl">
              {content.name}
            </h1>
            <p className="mt-4 max-w-xl text-balance font-serif text-xl italic leading-snug text-muted-foreground md:text-2xl">
              {content.tagline}
            </p>
          </div>
          <StoreButton />
        </div>

        <img
          src={`${base}hero.png`}
          alt={`${content.name} preview`}
          width={content.hero.width}
          height={content.hero.height}
          className="mt-12 h-auto w-full rounded-sm border border-border"
          fetchPriority="high"
        />

        <section className="mt-16 grid gap-8 border-t border-border pt-12 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-balance font-serif text-3xl leading-tight tracking-tight md:text-4xl">
            {content.narrative.heading}
          </h2>
          <div className="space-y-5">
            {content.narrative.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-pretty text-lg leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-primary">
            How it works
          </h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
            {content.steps.map((step, i) => (
              <li key={step.title} className="bg-card p-6">
                <span className="font-serif text-4xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-8 border-t border-border pt-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Key features
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight">
              What&apos;s inside
            </h2>
          </div>
          <ul className="space-y-4">
            {content.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 border-b border-border pb-4"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check
                    className="size-3"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-sm border border-border bg-card p-8 sm:flex-row sm:items-center md:p-10">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl">
              Try {content.shortName} today
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free to install. No account required.
            </p>
          </div>
          <StoreButton />
        </section>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-6 py-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://lunevdev.com"
              className="underline-offset-4 hover:underline"
            >
              Alex L.
            </a>
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Open source on{" "}
            <a
              href={content.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
