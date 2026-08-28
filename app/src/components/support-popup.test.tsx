import { render, screen } from '@testing-library/react';
import { mockStorageLocalGet } from '../../test/mockChrome';
import SupportPopup from './support-popup';

describe('SupportPopup', () => {
  it('links to the Chrome Web Store support page', async () => {
    mockStorageLocalGet({});
    render(<SupportPopup />);
    const link = await screen.findByRole('link', { name: 'Get support here' });
    expect(link).toHaveAttribute(
      'href',
      'https://chromewebstore.google.com/detail/eehodmhoejonfpbjbpiiennlakcjmbbd/support',
    );
  });
});
