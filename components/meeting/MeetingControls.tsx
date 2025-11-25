import { Video, VideoOff, Mic, MicOff, PhoneOff, X } from 'lucide-react';

interface MeetingControlsProps {
  isCameraOn: boolean;
  isAudioOn: boolean;
  onToggleCamera: () => void;
  onToggleAudio: () => void;
  onLeaveMeeting: () => void;
  onCloseMeeting: () => void;
}

export function MeetingControls({
  isCameraOn,
  isAudioOn,
  onToggleCamera,
  onToggleAudio,
  onLeaveMeeting,
  onCloseMeeting,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-6">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isAudioOn
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleCamera}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isCameraOn
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </button>

      {/* Leave Meeting */}
      <button
        onClick={onLeaveMeeting}
        className="px-6 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2 transition-all"
        aria-label="Leave meeting"
      >
        <PhoneOff className="w-5 h-5" />
        <span>Leave</span>
      </button>

      {/* End Meeting */}
      <button
        onClick={onCloseMeeting}
        className="px-6 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-all"
        aria-label="End meeting for all"
      >
        <X className="w-5 h-5" />
        <span>End Meeting</span>
      </button>
    </div>
  );
}
