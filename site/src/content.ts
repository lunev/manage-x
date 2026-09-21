export type Content = {
  id: string;
  shortName: string;
  name: string;
  tagline: string;
  hero: { width: number; height: number };
  repoUrl: string;
  narrative: { heading: string; body: string[] };
  steps: { title: string; body: string }[];
  features: string[];
};

export const content: Content = {
  id: "eehodmhoejonfpbjbpiiennlakcjmbbd",
  shortName: "ManageX",
  name: "ManageX – Extension Manager",
  tagline: "Your extensions, finally organized.",
  hero: { width: 1400, height: 560 },
  repoUrl: "https://github.com/lunev/manage-x",
  narrative: {
    heading: "For power users with too many extensions",
    body: [
      "When your toolbar overflows, context matters. ManageX – Extension Manager lets you group extensions by purpose and flip whole groups on or off in a click — dev tools for work, writing tools for drafting, nothing during a demo.",
      "Better yet, set URL rules so the right extensions activate automatically on the right sites, and get out of your own way.",
    ],
  },
  steps: [
    {
      title: "Group by purpose",
      body: "Sort your extensions into named groups like Work, Research, or Focus.",
    },
    {
      title: "Set URL rules",
      body: "Tell ManageX – Extension Manager which groups to enable or disable automatically on specific domains.",
    },
    {
      title: "Export and sync",
      body: "Export your setup as a file to back up or share across machines in seconds.",
    },
  ],
  features: [
    "Group extensions and toggle whole groups at once",
    "URL-based automatic enable and disable rules",
    "Export and import your full configuration",
    "Fast search across every installed extension",
    "Clean, keyboard-friendly interface",
  ],
};
