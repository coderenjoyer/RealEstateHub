import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface PatchFixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatchFixModal({ isOpen, onClose }: PatchFixModalProps) {
  const [patchMessage, setPatchMessage] = useState<string>("");
  const [patchTitle, setPatchTitle] = useState<string>("System Update");
  const [loading, setLoading] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(() => {
    return localStorage.getItem("patchFixModalDismissed") === "true";
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatchMessage();
    }
  }, [isOpen]);

  const fetchPatchMessage = async () => {
    setLoading(true);
    try {
      // TODO: Developer can modify this to fetch from database or hardcode a message
      // Example: Fetch from a patch_messages table or environment variable
      // For now, this is a placeholder that the developer can customize
      setPatchTitle("System Maintenance");
      setPatchMessage(
        "In v1.1.0\n" +
        "Fixed a bug in the agent messaging system\n" +
        "Fixed property detail responsiveness in mobile view\n" +
        "Removed user images in Agent Messaging\n" +
        "Fixed a bug where admin report in agent needs a refresh\n"
      );
    } catch (error) {
      console.error("Error fetching patch message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || hasBeenDismissed) return null;

  const handleClose = () => {
    localStorage.setItem("patchFixModalDismissed", "true");
    setHasBeenDismissed(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#49769F] to-[#0A4174] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{patchTitle}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-[#49769F] border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-700 font-semibold text-sm mb-3">{patchTitle}</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                {patchMessage.split('\n').filter((line) => line.trim().startsWith('-')).map((line, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#49769F] font-bold mt-0.5">•</span>
                    <span>{line.replace(/^-\s*/, '').trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 bg-[#49769F] hover:bg-[#3a5d7f] text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Acknowledged
          </button>
        </div>
      </div>
    </div>
  );
}
