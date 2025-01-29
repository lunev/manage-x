import { fireEvent, render, screen, waitFor } from '@test-utils';
import Dashboard from './Dashboard';
import * as hooks from '@/app/hooks';

describe('Dashboard Component', () => {
  it('renders correctly with initial props', () => {
    const useAppSelectorSpy = vi.spyOn(hooks, 'useAppSelector');

    render(<Dashboard />);

    expect(useAppSelectorSpy).toHaveBeenCalled();

    const dashboard = screen.getByTestId('dashboard');
    expect(dashboard).toBeInTheDocument();

    const heading = screen.getByText(/Dashboard/i);
    expect(heading).toBeInTheDocument();

    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });

  it('renders correctly with empty notes', () => {
    const customInitialState = {
      notes: { data: [] },
      preferences: { active: false, muted: true },
    };

    render(<Dashboard />, { initialState: customInitialState });

    const noNotesText = screen.getByText(/There are no notes yet/i);
    expect(noNotesText).toBeInTheDocument();
  });

  it('submit form correctly', async () => {
    const dispatchSpy = vi.spyOn(hooks, 'useAppDispatch');

    render(<Dashboard />);

    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();

    fireEvent.submit(form);

    expect(dispatchSpy).toHaveBeenCalled();

    await waitFor(() => {
      const validationErrorText = screen.getByText(/title is required/i);
      expect(validationErrorText).toBeInTheDocument();
    });
  });

  it('submits form with correct value', async () => {
    render(<Dashboard />);

    const input = screen.getByRole('textbox');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'New Note' } });

    fireEvent.submit(form);

    await waitFor(() => {
      const newNote = screen.getByText(/new note/i);
      expect(newNote).toBeInTheDocument();
    });
  });

  it('removes note correctly', async () => {
    const { container } = render(<Dashboard />);

    const button = screen.getByRole('button', {
      name: /Remove note: Take a break/i,
    });

    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      const notes = container.querySelectorAll('.note');
      expect(notes.length).toBe(1);
    });
  });
});
