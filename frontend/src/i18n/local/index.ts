/**
 * Agrégation des fichiers de traduction
 * ──────────────────────────────────────
 * Chaque langue a un dossier (`./fr/`, `./en/`) contenant un ou plusieurs
 * modules exportant par défaut un objet de traductions. Les objets sont
 * fusionnés en profondeur, ce qui permet de découper par domaine
 * (`nav.ts`, `home.ts`, …) sans écraser les clés voisines.
 */

type TranslationTree = { [key: string]: string | TranslationTree };

const modules = import.meta.glob('./*/*.ts', { eager: true });

/** Fusion récursive : deux fichiers peuvent alimenter la même section */
function mergeDeep(target: TranslationTree, source: TranslationTree): TranslationTree {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const existing = target[key];
      target[key] =
        existing && typeof existing === 'object'
          ? mergeDeep(existing as TranslationTree, value)
          : mergeDeep({}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const messages: Record<string, { translation: TranslationTree }> = {};

Object.keys(modules).forEach(path => {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
  if (!match) return;

  const [, lang] = match;
  const module = modules[path] as { default?: TranslationTree };
  if (!module.default) return;

  if (!messages[lang]) messages[lang] = { translation: {} };
  messages[lang].translation = mergeDeep(messages[lang].translation, module.default);
});

export default messages;
