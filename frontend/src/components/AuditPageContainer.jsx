/** Full-width container that respects sidebar offset and prevents horizontal overflow */
export default function AuditPageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full min-w-0 max-w-full ${className}`}>{children}</div>
  );
}
