import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import Faq from './Faq';

describe('Faq', () => {
  it('renders a Back to dashboard link and the FAQ heading', () => {
    render(<Faq />);

    expect(screen.getByRole('link', { name: /Back to dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('lists every question collapsed by default, expandable on click', () => {
    render(<Faq />);

    const question = screen.getByText('How do I turn an extension on or off?');
    const details = question.closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);

    fireEvent.click(question);
    expect(details.open).toBe(true);
  });
});
