import { mockSyncStorage } from './mockChrome';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ExtensionRule, GroupRule } from '@/types';

// Rules a test starts with; render() puts them into the mocked chrome.storage.sync.
type PreloadedState = {
  extensionRules?: { entities: ExtensionRule[] };
  groupRules?: { entities: GroupRule[] };
};

interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
  initialState?: PreloadedState;
}

const customRender = (
  ui: ReactElement,
  { route = '/', routerProps = {}, initialState = {}, ...options }: CustomRenderOptions = {},
) => {
  mockSyncStorage(
    Object.fromEntries([
      ...(initialState.extensionRules?.entities ?? []).map((rule) => [`er:${rule.id}`, rule]),
      ...(initialState.groupRules?.entities ?? []).map((rule) => [`gr:${rule.id}`, rule]),
    ]),
  );
  return render(
    <MemoryRouter initialEntries={[route]} {...routerProps}>
      <TooltipProvider delayDuration={0}>{ui}</TooltipProvider>
    </MemoryRouter>,
    options,
  );
};
// ignore-next-line
export * from '@testing-library/react';
export { customRender as render };
export { mockManagementGetAll, mockStorageLocalGet, mockSyncStorage } from './mockChrome';
