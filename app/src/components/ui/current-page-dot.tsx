// Small indicator dropped into a URL Rules tab label (Enabled/Disabled) when that tab's
// patterns are the ones currently in effect on the open tab, so the effect isn't hidden
// behind whichever tab happens to be selected.
const CurrentPageDot: React.FC = () => (
  <>
    <span
      className="relative ml-1.5 inline-flex size-1.5 shrink-0"
      aria-hidden="true"
      title="Currently affects the open page"
      data-testid="current-page-dot"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
    </span>
    <span className="sr-only"> — currently affects the open page</span>
  </>
);

export default CurrentPageDot;
