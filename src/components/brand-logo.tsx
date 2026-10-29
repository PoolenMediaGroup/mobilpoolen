import { Link } from "@tanstack/react-router";
import logo from "@/assets/mobilpoolen-logo.svg";
import logoWhite from "@/assets/mobilpoolen-logo-white.svg";

type BrandLogoProps = {
  variant?: "light" | "dark";
  width?: number;
  mobileWidth?: number;
  className?: string;
};

export function BrandLogo({
  variant = "light",
  width = 170,
  mobileWidth,
  className = "",
}: BrandLogoProps) {
  const safeWidth = Math.max(width, 120);
  const safeMobileWidth = mobileWidth ? Math.max(mobileWidth, 120) : safeWidth;

  return (
    <Link
      to="/"
      aria-label="Mobilpoolen, till startsidan"
      // min-h-11: länken är minst 44 px hög även när ordmärket bara är 24 px.
      className={`inline-flex min-h-11 shrink-0 items-center ${mobileWidth ? "brand-logo-responsive" : ""} ${className}`}
      style={
        {
          width: safeWidth,
          "--brand-logo-mobile-width": `${safeMobileWidth}px`,
        } as React.CSSProperties
      }
    >
      <img
        src={variant === "dark" ? logoWhite : logo}
        alt=""
        width={safeWidth}
        /* Ordmärkets viewBox är 825 x 158. */
        height={Math.round((safeWidth * 158) / 825)}
        className="block h-auto w-full"
      />
    </Link>
  );
}
