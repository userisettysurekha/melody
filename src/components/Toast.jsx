import { usePlayback } from '../context/PlaybackContext.jsx';

export default function Toast() {
  const { toast } = usePlayback();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div className="toast" key={toast.key}>{toast.message}</div>}
    </div>
  );
}
