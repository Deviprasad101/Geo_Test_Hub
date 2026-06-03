export default function AlertBox({ message, type }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} mb-4`} role="alert">
      {message}
    </div>
  );
}
