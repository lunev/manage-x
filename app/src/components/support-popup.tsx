import { ChatBubbleIcon } from '@radix-ui/react-icons';
import FloatingPopup from '@/components/floating-popup';

const SupportPopup = () => (
  <FloatingPopup
    storageKey="supportPopupDismissedAt"
    intervalDays={14}
    icon={<ChatBubbleIcon className="mt-1 size-3.5" />}
    messages={['Have a question about ManageX?', 'Got a suggestion for us?', 'Ran into a problem or bug?']}
    linkText="Get support here"
    linkHref="https://chromewebstore.google.com/detail/eehodmhoejonfpbjbpiiennlakcjmbbd/support"
  />
);

export default SupportPopup;
