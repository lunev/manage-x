import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActiveOnThisPage from './components/ActiveOnThisPage';
import ExtensionList from './components/ExtensionList';
import Rules from './components/Rules';

const Dashboard: React.FC = () => {
  return (
    <>
      <Tabs defaultValue="rules">
        <TabsList className="w-full">
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="rules">URL Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="extensions">
          <ActiveOnThisPage />
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
