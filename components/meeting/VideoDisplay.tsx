import { Video, VideoOff, Mic, MicOff, User } from 'lucide-react';

interface VideoDisplayProps {
  isCameraOn: boolean;
  isAudioOn: boolean;
}

export function VideoDisplay({ isCameraOn, isAudioOn }: VideoDisplayProps) {
  return (
    <div className="h-full flex gap-4">
      {/* Remote participant (larger view) */}
      <div className="flex-1 relative bg-gray-800 rounded-xl overflow-hidden">
        <div id="remote-video" className="absolute inset-0" />
        {/* Participant name and status */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-white">Participant</span>
          <div className="flex items-center gap-1">
            <Mic className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </div>

      {/* Local participant (smaller view) */}
      <div className="w-80 relative bg-gray-800 rounded-xl overflow-hidden">
        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <VideoOff className="w-10 h-10 text-gray-400" />
            </div>
            <span className="text-gray-400">Camera is off</span>
          </div>
        )}
        <div id="local-video" className="absolute inset-0" />
        {/* Your name and status */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-white">You</span>
          <div className="flex items-center gap-1">
            {isAudioOn ? (
              <Mic className="w-4 h-4 text-green-400" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
