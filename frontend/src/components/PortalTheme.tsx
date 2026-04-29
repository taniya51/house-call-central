import { ReactNode, useEffect } from "react";

interface Props {
  theme: "user" | "provider" | "admin";
  children: ReactNode;
}

/** Applies the portal theme class to <html> while mounted. */
export function PortalTheme({ theme, children }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-provider", "theme-admin");
    if (theme === "provider") root.classList.add("theme-provider");
    if (theme === "admin") root.classList.add("theme-admin");
    return () => {
      root.classList.remove("theme-provider", "theme-admin");
    };
  }, [theme]);
  return <>{children}</>;
}
