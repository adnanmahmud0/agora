    interface Props {
      isMicOn: boolean;
      isCameraOn: boolean;
      hasMic: boolean;
      hasCamera: boolean;
      isHost: boolean;
      toggleMic: () => void;
      toggleCamera: () => void;
      leaveMeeting: () => void;
      endMeetingForAll: () => void;
    }

    export default function MeetingControls({
      isMicOn,
      isCameraOn,
      hasMic,
      hasCamera,
      isHost,
      toggleMic,
      toggleCamera,
      leaveMeeting,
      endMeetingForAll,
    }: Props) {
      return (
        <div className="bg-gray-900/95 border-t border-gray-700 p-6">
          <div className="max-w-4xl mx-auto flex justify-center gap-6 flex-wrap">
            <button
              onClick={toggleMic}
              disabled={!hasMic}
              className={`px-10 py-4 rounded-full font-semibold text-lg ${
                !hasMic
                  ? "bg-gray-700"
                  : isMicOn
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600"
              }`}
            >
              {hasMic ? (isMicOn ? "Mute" : "Unmute") : "No Mic"}
            </button>

            <button
              onClick={toggleCamera}
              disabled={!hasCamera}
              className={`px-10 py-4 rounded-full font-semibold text-lg ${
                !hasCamera
                  ? "bg-gray-700"
                  : isCameraOn
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600"
              }`}
            >
              {hasCamera ? (isCameraOn ? "Cam Off" : "Cam On") : "No Camera"}
            </button>

            <button
              onClick={leaveMeeting}
              className="px-10 py-4 rounded-full bg-yellow-600 hover:bg-yellow-700 font-semibold text-lg"
            >
              Leave
            </button>

            {isHost && (
              <button
                onClick={endMeetingForAll}
                className="px-10 py-4 rounded-full bg-red-700 hover:bg-red-800 font-bold text-lg"
              >
                End for All
              </button>
            )}
          </div>
        </div>
      );
    }