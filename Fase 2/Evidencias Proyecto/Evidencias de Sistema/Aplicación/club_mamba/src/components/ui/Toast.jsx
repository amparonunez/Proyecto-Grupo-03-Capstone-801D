"use client";

export default function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-xl shadow-lg animate-fadeIn z-[9999]">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="text-yellow-400 font-bold text-lg hover:text-yellow-500">×</button>
      </div>
    </div>
  );
}
