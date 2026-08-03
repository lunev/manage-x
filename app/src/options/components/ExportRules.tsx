import { Button } from '@/components/ui/button';
import { exportUrlRules } from '@/lib/export';

const ExportRules: React.FC = () => (
  <>
    <h2 className="mb-1 muted-heading">Export URL Rules</h2>
    <Button size="xs" variant="cta" onClick={exportUrlRules}>
      Export
    </Button>
  </>
);

export default ExportRules;
