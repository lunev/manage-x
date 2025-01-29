import { fireEvent, render, screen, waitFor } from '@test-utils';
import Preferences from './Preferences';

describe('Preferences Component', () => {
  // Test to verify the Preferences component renders correctly with its initial state
  it('displays the Preferences component with initial state', () => {
    render(<Preferences />);

    // Check if the Preferences container is rendered
    const preferences = screen.getByTestId(/Preferences/i);
    expect(preferences).toBeInTheDocument();

    // Verify the heading text "Preferences" is displayed
    const heading = screen.getByText(/Preferences/i);
    expect(heading).toBeInTheDocument();
  });

  // Test to ensure preferences toggles correctly when interacting with checkboxes
  it('toggles preference state when checkbox is clicked', async () => {
    render(<Preferences />);

    // Find the first checkbox element
    const checkbox = screen.getAllByRole('checkbox')[0];

    // Ensure the checkbox exists and is initially checked
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    // Simulate a click on the checkbox to toggle its state
    fireEvent.click(checkbox);

    // Wait for the checkbox to reflect its toggled state
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });
});
