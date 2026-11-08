import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { uploadService, checkImageFile, IMAGE_ACCEPT } from '../../services/upload.service';

/**
 * Champs d'image du back-office : envoi depuis l'ordinateur (clic ou
 * glisser-déposer) vers POST /upload/image, avec repli sur une URL saisie.
 *
 *   <ImageField value={form.image} onChange={image => …} />           une image
 *   <ImageGalleryField value={form.images} onChange={images => …} />  plusieurs, la 1re est la principale
 */

// ── Envoi ──────────────────────────────────────────────────────────────────

/** Envoie les fichiers un par un ; renvoie les URL obtenues et les erreurs rencontrées */
function useImageUpload() {
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  async function upload(files: File[], notes: string[] = []): Promise<string[]> {
    setErrors([]);
    const urls: string[] = [];
    const problems: string[] = [...notes];
    setUploading(files.length);
    for (const file of files) {
      const invalid = checkImageFile(file);
      if (invalid) {
        problems.push(invalid);
      } else {
        try {
          urls.push(await uploadService.uploadImage(file));
        } catch (e) {
          problems.push(`« ${file.name} » : ${e instanceof Error ? e.message : 'envoi impossible'}`);
        }
      }
      setUploading(n => n - 1);
    }
    setUploading(0);
    setErrors(problems);
    return urls;
  }

  return { upload, uploading, errors, clearErrors: () => setErrors([]) };
}

/** Zone qui accepte des fichiers déposés */
function useDropZone(onFiles: (files: File[]) => void, disabled: boolean) {
  const [over, setOver] = useState(false);
  const handlers = {
    onDragOver: (e: DragEvent) => {
      if (disabled || !e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
  };
  return { over, handlers };
}

// ── Morceaux communs ───────────────────────────────────────────────────────

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <ul className="mt-2 space-y-0.5" role="alert">
      {errors.map(e => (
        <li key={e} className="text-xs text-red-600 flex gap-1.5">
          <i className="ri-error-warning-line mt-px"></i>
          <span>{e}</span>
        </li>
      ))}
    </ul>
  );
}

/** Saisie d'une URL d'image (lien externe ou fichier de /images) */
function UrlInput({ onSubmit, buttonLabel }: { onSubmit: (url: string) => void; buttonLabel: string }) {
  const [url, setUrl] = useState('');
  function submit() {
    const value = url.trim();
    if (!value) return;
    onSubmit(value);
    setUrl('');
  }
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        placeholder="https://… ou /images/…"
        className="flex-1 min-w-0 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!url.trim()}
        className="px-3 h-9 border border-gray-200 rounded-lg text-xs font-semibold text-[#00272B]/70 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function UrlToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="text-xs text-[#00272B]/50 hover:text-[#00272B] cursor-pointer flex items-center gap-1"
      >
        <i className={open ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}></i>
        Utiliser une adresse d&apos;image
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ── Une image ──────────────────────────────────────────────────────────────

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Classe de proportion de l'aperçu (`aspect-[16/10]`…) */
  aspectClass?: string;
  hint?: string;
}

export function ImageField({ value, onChange, label = 'Image', aspectClass = 'aspect-[16/10]', hint }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, errors, clearErrors } = useImageUpload();
  const busy = uploading > 0;

  async function handleFiles(files: File[]) {
    const [url] = await upload(files.slice(0, 1));
    if (url) onChange(url);
  }
  const { over, handlers } = useDropZone(handleFiles, busy);

  return (
    <div>
      <p className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">{label}</p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div
          {...handlers}
          className={`relative w-full sm:w-56 ${aspectClass} rounded-xl overflow-hidden border-2 border-dashed flex-shrink-0 transition-colors ${
            over ? 'border-[#1AAA3F] bg-[#1AAA3F]/5' : value ? 'border-transparent bg-gray-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          {value ? (
            <img src={value} alt="Aperçu" className="w-full h-full object-contain" />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#00272B]/40 hover:text-[#1AAA3F] cursor-pointer"
            >
              <i className="ri-image-add-line text-2xl"></i>
              <span className="text-xs font-medium">Choisir ou déposer une image</span>
            </button>
          )}
          {busy && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 text-sm text-[#00272B]/70">
              <i className="ri-loader-4-line animate-spin"></i> Envoi…
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="px-3 h-9 bg-[#1AAA3F] text-white rounded-lg text-xs font-semibold hover:bg-[#158f35] cursor-pointer disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
            >
              <i className="ri-upload-2-line"></i>
              {value ? 'Remplacer' : 'Téléverser'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); clearErrors(); }}
                disabled={busy}
                className="px-3 h-9 border border-gray-200 rounded-lg text-xs font-semibold text-[#00272B]/60 hover:text-red-600 hover:border-red-200 cursor-pointer disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
              >
                <i className="ri-delete-bin-line"></i>
                Retirer
              </button>
            )}
          </div>
          <p className="text-xs text-[#00272B]/40 mt-2">{hint ?? 'JPG, PNG, WebP ou GIF, 10 Mo maximum.'}</p>
          <UrlToggle>
            <UrlInput buttonLabel="Utiliser" onSubmit={url => { onChange(url); clearErrors(); }} />
          </UrlToggle>
          <ErrorList errors={errors} />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = ''; // permet de choisir à nouveau le même fichier
          if (files.length) handleFiles(files);
        }}
      />
    </div>
  );
}

// ── Plusieurs images ───────────────────────────────────────────────────────

interface ImageGalleryFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export function ImageGalleryField({ value, onChange, label = 'Photos', max = 8 }: ImageGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, errors, clearErrors } = useImageUpload();
  const busy = uploading > 0;
  const room = max - value.length;
  // Toujours lire la dernière liste : plusieurs envois peuvent se terminer après un retrait
  const valueRef = useRef(value);
  valueRef.current = value;

  function add(urls: string[]) {
    const next = [...valueRef.current];
    for (const url of urls) if (!next.includes(url)) next.push(url);
    onChange(next.slice(0, max));
  }

  async function handleFiles(files: File[]) {
    const accepted = files.slice(0, Math.max(room, 0));
    const notes = files.length > accepted.length
      ? [`${files.length - accepted.length} fichier(s) ignoré(s) : ${max} photos maximum.`]
      : [];
    const urls = await upload(accepted, notes);
    if (urls.length) add(urls);
  }
  const { over, handlers } = useDropZone(handleFiles, busy || room <= 0);

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    clearErrors();
  }

  function makeMain(index: number) {
    onChange([value[index], ...value.filter((_, i) => i !== index)]);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs font-semibold text-[#00272B]/60">{label}</p>
        <p className="text-xs text-[#00272B]/40">{value.length} / {max}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3" {...handlers}>
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-contain" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#00272B] text-white text-[10px] font-semibold">
                Principale
              </span>
            )}
            <div className="absolute top-1.5 right-1.5 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  title="Mettre en photo principale"
                  aria-label={`Mettre la photo ${i + 1} en photo principale`}
                  className="w-7 h-7 rounded-lg bg-white/95 shadow flex items-center justify-center text-[#00272B]/60 hover:text-amber-500 cursor-pointer"
                >
                  <i className="ri-star-line text-sm"></i>
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                title="Retirer"
                aria-label={`Retirer la photo ${i + 1}`}
                className="w-7 h-7 rounded-lg bg-white/95 shadow flex items-center justify-center text-[#00272B]/60 hover:text-red-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          </div>
        ))}

        {room > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors disabled:cursor-wait ${
              over ? 'border-[#1AAA3F] bg-[#1AAA3F]/5 text-[#1AAA3F]' : 'border-gray-200 text-[#00272B]/40 hover:border-[#1AAA3F] hover:text-[#1AAA3F]'
            }`}
          >
            {busy ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xl"></i>
                <span className="text-[11px] font-medium">Envoi ({uploading})…</span>
              </>
            ) : (
              <>
                <i className="ri-image-add-line text-xl"></i>
                <span className="text-[11px] font-medium text-center px-1">Ajouter ou déposer</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-[#00272B]/40 mt-2">
        La première photo sert d&apos;image principale. JPG, PNG, WebP ou GIF, 10 Mo maximum par fichier.
      </p>
      {room > 0 && (
        <UrlToggle>
          <UrlInput buttonLabel="Ajouter" onSubmit={url => { add([url]); clearErrors(); }} />
        </UrlToggle>
      )}
      <ErrorList errors={errors} />

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) handleFiles(files);
        }}
      />
    </div>
  );
}
