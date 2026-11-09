import { useNavigate, useLocation, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { createElement, Fragment, useEffect } from "react";
import routes from "./config";
import RevealObserver from "../components/feature/RevealObserver";
import FloatingActions from "../components/feature/FloatingActions";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

/** Espaces de travail (back-office, espace client) : ni fondu de page ni boutons flottants */
const isWorkspace = (path: string) => path.startsWith("/admin") || path.startsWith("/espace-client");
/** Tunnel d'achat et paiement : rien ne doit distraire du bouton principal */
const isFocusedFlow = (path: string) => path.startsWith("/checkout") || path.startsWith("/paiement");

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });

  // Nouvelle page : on repart du haut (sauf ancre #section), sans défilement animé
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  const workspace = isWorkspace(pathname);
  return createElement(
    Fragment,
    null,
    createElement(RevealObserver),
    workspace
      ? element
      // La clé relance le fondu à chaque changement de page publique
      : createElement("div", { key: pathname, className: "motion-safe:animate-page-in" }, element),
    !workspace && !isFocusedFlow(pathname) ? createElement(FloatingActions) : null,
  );
}
