import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@test-utils';
import Faq from './Faq';
import Header from '@/components/layout/header/Header';
import { HeaderIdentityProvider } from '@/components/layout/header/HeaderIdentityContext';

describe('Faq', () => {
  it('renders the FAQ heading in the header, with no avatar', () => {
    render(
      <HeaderIdentityProvider>
        <Header />
        <Faq />
      </HeaderIdentityProvider>,
      { route: '/faq/' },
    );

    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
    expect(document.querySelector('header')?.querySelectorAll('img').length).toBe(0);
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
