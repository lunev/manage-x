// Small corner indicator shown on Extension/Group tiles when a rule is currently forcing
// their enabled/disabled state on the open tab, so that's visible without hovering.
// Individual Extension Rules use the app's primary color; Extension Groups use the red from
// the logo, so the two are visually distinguishable at a glance.
const RuleBadge: React.FC<{ colorClassName?: string }> = ({ colorClassName = 'bg-primary' }) => (
  <span
    aria-hidden="true"
    data-testid="rule-badge"
    className={`absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-background ${colorClassName}`}
  />
);

export default RuleBadge;
