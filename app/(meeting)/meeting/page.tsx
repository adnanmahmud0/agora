"use client";

import { MeetingControls } from '@/components/meeting/MeetingControls';
import { MeetingEndedScreen } from '@/components/meeting/MeetingEndedScreen';
import { VideoDisplay } from '@/components/meeting/VideoDisplay';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';


export default function MeetingInterface() {
  const searchParams = useSearchParams();
  const channelName = searchParams.get('channelName') || '';
  const token = searchParams.get('token') || '';
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID as string;
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [meetingStatus, setMeetingStatus] = useState<'active' | 'left' | 'ended'>('active');
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<ILocalAudioTrack | null>(null);
  const localVideoRef = useRef<ILocalVideoTrack | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!appId || !channelName || !token) return;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && user.videoTrack) {
          user.videoTrack.play('remote-video');
        }
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType) => {
        if (mediaType === 'video' && user.videoTrack) {
          user.videoTrack.stop();
        }
      });

      await client.join(appId, channelName, token);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const camTrack = await AgoraRTC.createCameraVideoTrack();
      localAudioRef.current = micTrack;
      localVideoRef.current = camTrack;

      camTrack.play('local-video');
      await client.publish([micTrack, camTrack]);
    };
    run();

    return () => {
      const client = clientRef.current;
      const mic = localAudioRef.current;
      const cam = localVideoRef.current;
      try {
        mic?.close();
        cam?.close();
        client?.leave();
      } catch {}
      clientRef.current = null;
      localAudioRef.current = null;
      localVideoRef.current = null;
    };
  }, [appId, channelName, token]);

  const handleToggleCamera = () => {
    const next = !isCameraOn;
    setIsCameraOn(next);
    localVideoRef.current?.setEnabled(next);
  };

  const handleToggleAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    localAudioRef.current?.setEnabled(next);
  };

  const handleLeaveMeeting = () => {
    const client = clientRef.current;
    const mic = localAudioRef.current;
    const cam = localVideoRef.current;
    try {
      mic?.close();
      cam?.close();
      client?.leave();
    } catch {}
    setMeetingStatus('left');
  };

  const handleCloseMeeting = () => {
    const client = clientRef.current;
    const mic = localAudioRef.current;
    const cam = localVideoRef.current;
    try {
      mic?.close();
      cam?.close();
      client?.leave();
    } catch {}
    setMeetingStatus('ended');
  };

  const handleRejoinMeeting = () => {
    setMeetingStatus('active');
  };

  console.log('channelName:', channelName);
  console.log('token:', token);

  if (meetingStatus === 'left' || meetingStatus === 'ended') {
    return (
      <MeetingEndedScreen 
        status={meetingStatus}
        onRejoin={meetingStatus === 'left' ? handleRejoinMeeting : undefined}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white">Meeting in progress</span>
          {channelName && (
            <span className="ml-3 text-xs text-gray-300">Channel: {channelName}</span>
          )}
        </div>
        <div className="text-gray-400">
          {token && (
            <span className="text-xs text-gray-500">Token received</span>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative p-6">
        <VideoDisplay 
          isCameraOn={isCameraOn}
          isAudioOn={isAudioOn}
        />
      </div>

      {/* Controls */}
      <div className="pb-8">
        <MeetingControls
          isCameraOn={isCameraOn}
          isAudioOn={isAudioOn}
          onToggleCamera={handleToggleCamera}
          onToggleAudio={handleToggleAudio}
          onLeaveMeeting={handleLeaveMeeting}
          onCloseMeeting={handleCloseMeeting}
        />
      </div>
    </div>
  );
}
