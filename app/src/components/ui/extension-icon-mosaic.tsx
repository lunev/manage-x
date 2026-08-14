import { AvatarFallback } from '@/components/ui/avatar';

// Fills an Avatar with the icons of a set of extensions, rather than a generic initial letter —
// a single extension fills the whole circle; 2-4 tile in a 2x2 mosaic; a 5th+ extension
// collapses into a "+N" cell instead of shrinking icons further.
type ExtensionIconMosaicProps = {
  icons: chrome.management.ExtensionInfo[];
};

const ExtensionIconMosaic: React.FC<ExtensionIconMosaicProps> = ({ icons }) => {
  if (icons.length === 0) return null;

  if (icons.length === 1) {
    const url = icons[0].icons?.at(-1)?.url;
    return url ? (
      <img src={url} alt="" className="h-full w-full object-cover" />
    ) : (
      <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
        {icons[0].name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    );
  }

  const overflow = icons.length > 4 ? icons.length - 3 : 0;
  const displayIcons = overflow > 0 ? icons.slice(0, 3) : icons.slice(0, 4);

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px">
      {displayIcons.map((ext) => (
        <img key={ext.id} src={ext.icons?.at(-1)?.url} alt="" className="h-full w-full object-cover" />
      ))}
      {overflow > 0 && (
        <span className="flex items-center justify-center bg-muted text-[7px] font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default ExtensionIconMosaic;
