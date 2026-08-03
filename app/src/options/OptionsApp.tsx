import ExportRules from './components/ExportRules';
import ImportRules from '@/components/import-rules';

const OptionsApp = () => {
  return (
    <div className="px-6 pb-6">
      <ExportRules />
      <div className="mt-6">
        <ImportRules />
      </div>
    </div>
  );
};

export default OptionsApp;
