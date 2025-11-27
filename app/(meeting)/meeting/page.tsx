"use client";

import MeetingControls from "@/components/meeting/MeetingControls";
import MeetingStatus from "@/components/meeting/MeetingStatus";
import VideoGrid from "@/components/meeting/VideoGrid";
import useAgoraMeeting from "@/hooks/useAgoraMeeting";
import { useSearchParams } from "next/navigation";


export default function MeetingPage() {
  const searchParams = useSearchParams();
  const channelName = searchParams.get("channelName");
  const token = searchParams.get("token");
  const initialMicOn = searchParams.get("mic") === "1";
  const initialCameraOn = searchParams.get("cam") === "1";

  const {
    isJoined,
    remoteUsers,
    remoteName,
    isHost,
    isMicOn,
    isCameraOn,
    hasMic,
    hasCamera,
    toggleMic,
    toggleCamera,
    leaveMeeting,
    endMeetingForAll,
  } = useAgoraMeeting({ channelName, token, initialMicOn, initialCameraOn });

  if (!channelName || !token) {
    return <div className="text-white text-center p-10">Invalid meeting link</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <VideoGrid remoteUsers={remoteUsers} remoteName={remoteName} />
      <MeetingControls
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        hasMic={hasMic}
        hasCamera={hasCamera}
        isHost={isHost}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
        leaveMeeting={leaveMeeting}
        endMeetingForAll={endMeetingForAll}
      />
      <MeetingStatus isJoined={isJoined} totalUsers={remoteUsers.length + 1} />
    </div>
  );
}
