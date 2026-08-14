import { useSetHeaderIdentity } from '@/components/layout/header/HeaderIdentityContext';

type FaqItem = { question: string; answer: React.ReactNode };

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I turn an extension on or off?',
    answer:
      'Click its icon in the Extensions grid to toggle it directly. Double-click the icon to open (or create) its rule instead.',
  },
  {
    question: 'How do Extension Rules work?',
    answer:
      "An Extension Rule automatically enables or disables a single extension based on the website you're on. Create one from the Extensions grid by double-clicking an icon, and remove it with the Delete button on its edit page.",
  },
  {
    question: 'How do Extension Groups work?',
    answer:
      'A group lets you control several extensions together with one set of URL rules, so they turn on or off as a set instead of managing each one separately.',
  },
  {
    question: 'What do the colored dots on an icon mean?',
    answer:
      "A dot appears on an icon when a rule is actively controlling it on the page you have open — the app's accent color for an individual Extension Rule, red for an Extension Group.",
  },
  {
    question: "Why can't I toggle an extension manually?",
    answer:
      "If an active rule is currently enabling or disabling it on this page, ManageX won't let a manual click override it by mistake. Hover the icon to see which rule is responsible, with a link to edit it.",
  },
  {
    question: 'What URL patterns can I use?',
    answer: (
      <ul className="list-inside list-disc space-y-1">
        <li>
          <code>example.com</code> — matches this exact domain only.
        </li>
        <li>
          <code>*.example.com</code> — matches all subdomains (e.g., <em>blog.example.com</em>).
        </li>
        <li>
          <code>docs.*.com</code> — wildcard matches any characters (e.g., <em>docs.google.com</em>).
        </li>
        <li>
          Supports <code>localhost</code> and IPs like <code>localhost:3000</code> or <code>192.168.1.*</code>.
        </li>
      </ul>
    ),
  },
  {
    question: 'What happens when a rule for an extension and a rule for a group both apply?',
    answer:
      "An active individual Extension Rule with at least one Enabled or Disabled URL always wins over any Extension Group containing that extension, even if the individual rule's own URL patterns don't match the current page. An individual rule with no URLs saved has no effect and won't block a group. Within a single rule, a Disabled match always wins over an Enabled one.",
  },
  {
    question: 'Can I back up or transfer my rules?',
    answer: 'Yes — use "Export URL Rules" and "Import URL Rules" from the ⋮ menu in the header.',
  },
];

const Faq: React.FC = () => {
  useSetHeaderIdentity({ heading: 'FAQ', avatar: false });

  return (
    <div className="fade-in rounded-xl bg-card p-4 shadow-soft">
      <div className="divide-y divide-border text-xs">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="py-2 first:pt-0 last:pb-0">
            <summary className="cursor-pointer font-medium">{item.question}</summary>
            <div className="mt-1.5 text-muted-foreground">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default Faq;
