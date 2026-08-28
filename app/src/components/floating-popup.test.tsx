import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockStorageLocalGet } from '../../test/mockChrome';
import FloatingPopup from './floating-popup';

const props = {
  storageKey: 'k',
  intervalDays: 30,
  messages: ['Need help?'],
  linkText: 'Contact us',
  linkHref: 'https://example.com/support',
};

describe('FloatingPopup', () => {
  it('renders nothing when not due', async () => {
    mockStorageLocalGet({ k: Date.now() });
    render(<FloatingPopup {...props} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a single message as static text (no animation) and an external link when due', async () => {
    mockStorageLocalGet({});
    render(<FloatingPopup {...props} />);
    await screen.findByRole('link', { name: 'Contact us' });
    expect(screen.getByText('Need help?')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Contact us' });
    expect(link).toHaveAttribute('href', 'https://example.com/support');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('types out and cycles through multiple messages', async () => {
    mockStorageLocalGet({});
    render(<FloatingPopup {...props} messages={['First', 'Second']} />);
    await screen.findByRole('link', { name: 'Contact us' });
    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument(), { timeout: 2000 });
    await waitFor(() => expect(screen.getByText('Second')).toBeInTheDocument(), { timeout: 4000 });
  }, 8000);

  it('keeps the message clipped to a single line', async () => {
    mockStorageLocalGet({});
    const { container } = render(<FloatingPopup {...props} />);
    await screen.findByRole('link', { name: 'Contact us' });
    expect(container.querySelector('.truncate')).toBeInTheDocument();
  });

  it('dismisses on close click', async () => {
    mockStorageLocalGet({});
    render(<FloatingPopup {...props} />);
    await screen.findByRole('link', { name: 'Contact us' });
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.queryByRole('link')).not.toBeInTheDocument());
  });

  it('defaults to the bottom-right corner', async () => {
    mockStorageLocalGet({});
    const { container } = render(<FloatingPopup {...props} />);
    await screen.findByRole('link', { name: 'Contact us' });
    expect(container.querySelector('.bottom-3.right-3')).toBeInTheDocument();
  });

  it('honors a custom position', async () => {
    mockStorageLocalGet({});
    const { container } = render(<FloatingPopup {...props} position="top-left" />);
    await screen.findByRole('link', { name: 'Contact us' });
    expect(container.querySelector('.top-3.left-3')).toBeInTheDocument();
  });
});
