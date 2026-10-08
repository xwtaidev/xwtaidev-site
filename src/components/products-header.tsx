import Link from "next/link";
import type { ReactNode } from "react";
import { OrbitNavigation } from "./orbit-navigation";
import { ThemeButton } from "./theme-button";

export function ProductsHeader({ children, detail = false }: { children?: ReactNode; detail?: boolean }) {
  return (
    <header className="products-header">
      <div className="products-identity">
        <OrbitNavigation currentPage="products" />
        {detail ? <Link className="products-context" href="/products">Products</Link> : <h1 className="products-context">Products</h1>}
      </div>
      <div className="products-actions"><ThemeButton />{children}</div>
    </header>
  );
}
