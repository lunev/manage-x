import { render, screen } from '@test-utils';
import Main from './Main';

describe('Main Component', () => {
  // Test to verify that the Main component renders correctly with its children
  it('renders correctly with children', () => {
    // Render the Main component with a child heading element
    render(
      <Main>
        <h2>Main Component</h2>
      </Main>,
    );

    // Find the main element by its role
    const main = screen.getByRole('main');
    // Assert that the main element is present in the document
    expect(main).toBeInTheDocument();

    // Find the heading element by its role and accessible name
    const heading = screen.getByRole('heading', { name: /main component/i });
    // Assert that the heading is present in the document
    expect(heading).toBeInTheDocument();
  });
});
