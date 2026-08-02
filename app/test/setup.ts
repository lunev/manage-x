import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement ResizeObserver or scrollIntoView; cmdk (the Command palette
// primitive) relies on both to size itself and to scroll the highlighted item into view.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
Element.prototype.scrollIntoView = vi.fn();

// jsdom has no PointerEvent constructor, so testing-library's fireEvent.pointerDown/
// pointerMove/etc. silently fall back to a plain Event with no `.button`/`.pointerId`.
// Radix primitives (DropdownMenu, Tooltip, Popover, Select, ...) gate their open/close
// logic on those properties, so without this polyfill those interactions silently no-op.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;
    public width: number;
    public height: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? 'mouse';
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
    }
  }
  // @ts-expect-error -- assigning a MouseEvent-based polyfill in place of the real class
  globalThis.PointerEvent = PointerEvent;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
});
