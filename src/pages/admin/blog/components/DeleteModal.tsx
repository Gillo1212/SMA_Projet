interface Props {
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ itemName, onClose, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-delete-bin-2-line text-red-500 text-xl"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#00272B] mb-1">Supprimer l&apos;article ?</h3>
            <p className="text-sm text-[#00272B]/50 leading-relaxed">
              Vous allez supprimer <strong className="text-[#00272B]">{itemName}</strong>. Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#00272B]/60 hover:text-[#00272B] cursor-pointer whitespace-nowrap"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-delete-bin-line"></i>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
