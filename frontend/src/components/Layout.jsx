import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  const navClass = (path) =>
    `nav-link${pathname === path || (path !== "/" && pathname.startsWith(path)) ? " active" : ""}`;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-globe-americas" />
            <span>Geo Test Hub</span>
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className={navClass("/")} to="/">
              Dashboard
            </Link>
            <Link className={navClass("/create")} to="/create">
              Create Project
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">{children}</main>

      <footer className="app-footer text-center py-3">
        <div className="container text-muted small">
          Geospatial Testing Platform — Module 2: Project Upload
        </div>
      </footer>
    </>
  );
}
