import { CheckCircle, XCircle } from 'lucide-react';

interface MeetingEndedScreenProps {
  status: 'left' | 'ended';
  onRejoin?: () => void;
}

export function MeetingEndedScreen({ status, onRejoin }: MeetingEndedScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md px-6">
        {status === 'left' ? (
          <>
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-white text-3xl mb-3">You left the meeting</h1>
            <p className="text-gray-400 mb-8">
              The meeting is still in progress. You can rejoin anytime.
            </p>
            {onRejoin && (
              <button
                onClick={onRejoin}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                Rejoin Meeting
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-white text-3xl mb-3">Meeting ended</h1>
            <p className="text-gray-400 mb-8">
              The meeting has been ended for all participants.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Return to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
