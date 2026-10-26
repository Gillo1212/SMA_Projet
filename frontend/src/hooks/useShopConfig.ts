/**
 * Hook Config boutique
 * ─────────────────────
 *   const { config, isLoading } = useShopConfig();
 *
 * Tant que la config n'est pas chargée (ou si l'API échoue), les valeurs par
 * défaut du backend s'appliquent : le backend recalcule de toute façon le
 * montant à la création de la commande.
 */
import { useEffect, useState } from 'react';
import { shopService } from '../services/shop.service';
import { DEFAULT_SHOP_CONFIG } from '../utils/orderTotals';
import type { ShopConfig } from '../types/models';

export function useShopConfig() {
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    shopService
      .getConfig()
      .then(c => { if (!cancelled) setConfig(c); })
      .catch(() => { /* valeurs par défaut conservées */ })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { config, isLoading };
}
