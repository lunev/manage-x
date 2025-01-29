import { createMockStore } from './mockStore';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { PreloadedState } from './mockStore'; // Ensure you export this from your mockStore file

interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
  initialState?: PreloadedState;
}

const customRender = (
  ui: ReactElement,
  {
    route = '/',
    routerProps = {},
    initialState = {},
    ...options
  }: CustomRenderOptions = {},
) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]} {...routerProps}>
        {ui}
      </MemoryRouter>
    </Provider>,
    options,
  );
};
// ignore-next-line
export * from '@testing-library/react';
export { customRender as render };
