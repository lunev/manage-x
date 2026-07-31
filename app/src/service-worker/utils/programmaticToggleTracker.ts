// Chrome's management.onEnabled/onDisabled events fire the same way whether a user
// manually toggled an extension or our own rule engine did it via management.setEnabled.
// Rules that match chrome://extensions/ would otherwise get misread as a manual toggle
// and overwrite the extension's saved default state. Marking a toggle here before we
// make it lets the manual-toggle listener skip it.
const pendingProgrammaticToggles = new Set<string>();

export function markProgrammaticToggle(extId: string) {
  pendingProgrammaticToggles.add(extId);
  // Safety net in case the corresponding event never fires for some reason.
  setTimeout(() => pendingProgrammaticToggles.delete(extId), 3000);
}

export function consumeProgrammaticToggle(extId: string): boolean {
  if (!pendingProgrammaticToggles.has(extId)) return false;
  pendingProgrammaticToggles.delete(extId);
  return true;
}
