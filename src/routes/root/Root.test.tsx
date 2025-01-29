import { render, screen } from '@test-utils'; // Import necessary testing utilities
import Root from './Root'; // Import the Root component

describe('Root Component', () => {
  // Test case to verify the correct rendering of the Root component
  it('renders correctly with initial props', () => {
    render(<Root />); // Render the Root component

    // Select the header element by its role (banner)
    const header = screen.getByRole('banner');
    // Verify that the header element is in the document
    expect(header).toBeInTheDocument();

    // Select the main content element by its role (main)
    const main = screen.getByRole('main');
    // Verify that the main element is in the document
    expect(main).toBeInTheDocument();
  });
});
