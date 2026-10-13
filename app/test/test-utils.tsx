import { createMockStore } from './mockStore';
import { mockSyncStorage } from './mockChrome';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { PreloadedState } from './mockStore'; // Ensure you export this from your mockStore file
import { TooltipProvider } from '@/components/ui/tooltip';

interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
  initialState?: PreloadedState;
}

const customRender = (
  ui: ReactElement,
  { route = '/', routerProps = {}, initialState = {}, ...options }: CustomRenderOptions = {},
) => {
  const store = createMockStore(initialState);
  // Same rules into the mocked chrome.storage.sync, for components already reading via useRules().
  mockSyncStorage(
    Object.fromEntries([
      ...(initialState.extensionRules?.entities ?? []).map((rule) => [`er:${rule.id}`, rule]),
      ...(initialState.groupRules?.entities ?? []).map((rule) => [`gr:${rule.id}`, rule]),
    ]),
  );
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]} {...routerProps}>
        <TooltipProvider delayDuration={0}>{ui}</TooltipProvider>
      </MemoryRouter>
    </Provider>,
    options,
  );
};
// ignore-next-line
export * from '@testing-library/react';
export { customRender as render };
export { mockManagementGetAll, mockStorageLocalGet, mockSyncStorage } from './mockChrome';
