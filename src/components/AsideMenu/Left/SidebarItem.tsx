import { Link } from "react-router-dom";

export const SidebarItem = ({
  to,
  icon,
  label,
  show = true,
}: {
  to: string;
  icon: string;
  label: string;
  show?: boolean;
}) => {
  if (!show) return null;
  return (
    <li>
      <Link to={to} className="sidebar-link">
        <span>{icon}</span> {label}
      </Link>
    </li>
  );
};
