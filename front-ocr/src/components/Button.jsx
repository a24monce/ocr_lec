export default function Button({ onClick, children }) {
    return (
      <button 
        onClick={onClick}
        className="px-4 py-2 bg-[#b6aaff] text-white rounded-lg"
      >
        {children}
      </button>
    );
  }
