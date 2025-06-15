import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExtensionList from './components/ExtensionList';
import Rules from './components/Rules';

const Dashboard: React.FC = () => {
  return (
    <>
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="extensions" className="flex-1 text-xs">
            Extensions
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 text-xs">
            URL Rules
          </TabsTrigger>
        </TabsList>
        <TabsContent value="extensions">
          <ExtensionList />
        </TabsContent>
        <TabsContent value="rules">
          <Rules />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Dashboard;
