export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="text-center py-4">
      <div className="spinner" />
      <div className="text-muted small mt-2">{label}</div>
    </div>
  );
}