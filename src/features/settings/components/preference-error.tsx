export const PreferenceError = ({ show }: { show: boolean }) =>
  show ? (
    <p role="alert" className="text-sm text-destructive">
      Could not save your preference. Your previous setting is still in use.
      Please try again.
    </p>
  ) : null;
