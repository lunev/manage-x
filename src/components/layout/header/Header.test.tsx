import { screen, render } from '@test-utils';
import Header from './Header';

describe('Header Component', () => {
  // Before each test, render the Header component
  beforeEach(() => {
    render(<Header />);
  });

  // Test to ensure the logo is displayed in the Header
  it('renders logo', () => {
    // Find the logo element by its role and accessible name
    const logo = screen.getByRole('img', { name: /logo/i });

    // Assert that the logo is present in the document
    expect(logo).toBeInTheDocument();
  });

  // Test to verify the presence of the Preferences link
  it('renders preferences link', () => {
    // Find the Preferences link by its role and accessible name
    const preferencesLink = screen.getByRole('link', { name: /preferences/i });

    // Assert that the Preferences link is present in the document
    expect(preferencesLink).toBeInTheDocument();
  });
});
