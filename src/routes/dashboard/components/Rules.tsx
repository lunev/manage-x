import ExtensionRulesList from './ExtensionRulesList';
import GroupRulesList from './GroupRulesList';

const Rules: React.FC = () => {
  return (
    <div className="fade-in">
      <ExtensionRulesList />
      <GroupRulesList />
    </div>
  );
};

export default Rules;
