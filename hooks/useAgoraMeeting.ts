/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import AgoraRTC, {
    IAgoraRTCClient,
    ILocalVideoTrack,
    ILocalAudioTrack,
    IRemoteVideoTrack,
    IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchMyMeetings, closeMeeting } from "@/integration/meetings";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

interface UseAgoraMeetingProps {
    channelName: string | null;
    token: string | null;
    initialMicOn?: boolean;
    initialCameraOn?: boolean;
}

export default function useAgoraMeeting({ channelName, token, initialMicOn = false, initialCameraOn = false }: UseAgoraMeetingProps) {
    const { user } = useAuth();

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrack = useRef<ILocalAudioTrack | null>(null);
    const localVideoTrack = useRef<ILocalVideoTrack | null>(null);
    const localScreenTrack = useRef<ILocalVideoTrack | null>(null);

    const [isJoined, setIsJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [remoteName, setRemoteName] = useState("Participant");
    const [isHost, setIsHost] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [hasMic, setHasMic] = useState(true);
    const [hasCamera, setHasCamera] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    useEffect(() => {
        if (!channelName || !token || !APP_ID || !user?._id) return;

        let mounted = true;

        const init = async () => {
            const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            try {
                await client.join(APP_ID, channelName, token, null);
                if (!mounted) return;
                setIsJoined(true);

                // Detect users already in channel (fixes late joiner issue)
                if (client.remoteUsers.length > 0) {
                    setRemoteUsers(client.remoteUsers);
                }

                const toPublish: Array<ILocalAudioTrack | ILocalVideoTrack> = [];
                if (initialMicOn) {
                    try {
                        const mic = await AgoraRTC.createMicrophoneAudioTrack();
                        localAudioTrack.current = mic;
                        toPublish.push(mic);
                        setIsMicOn(true);
                        setHasMic(true);
                    } catch {
                        setHasMic(false);
                        setIsMicOn(false);
                    }
                } else {
                    setIsMicOn(false);
                    setHasMic(true);
                }

                if (initialCameraOn) {
                    try {
                        const cam = await AgoraRTC.createCameraVideoTrack();
                        localVideoTrack.current = cam;
                        cam.play("local-video");
                        toPublish.push(cam);
                        setIsCameraOn(true);
                        setHasCamera(true);
                    } catch {
                        setHasCamera(false);
                        setIsCameraOn(false);
                    }
                } else {
                    setIsCameraOn(false);
                    setHasCamera(true);
                }

                if (toPublish.length > 0) {
                    await client.publish(toPublish);
                }

                // Load meeting info
                try {
                    const meetings = await fetchMyMeetings();
                    const meeting = meetings.find((m: any) => m.roomId === channelName);
                    if (meeting) {
                        const iAmHost = meeting.creator.id === user._id;
                        setIsHost(iAmHost);
                        setRemoteName(iAmHost ? meeting.participant.name : meeting.creator.name);
                    }
                } catch (e) {
                    console.warn("Failed to load participant name", e);
                }

                // Remote Events (FIXED + TYPE SAFE - NO getTrackLabel)
                client.on("user-joined", (user) => {
                    setRemoteUsers((prev) => prev.some(u => u.uid === user.uid) ? prev : [...prev, user]);
                });

                client.on("user-published", async (user, mediaType) => {
                    await client.subscribe(user, mediaType);

                    if (mediaType === "video" && user.videoTrack) {
                        const container = document.getElementById("remote-video");
                        if (container) container.innerHTML = "";
                        (user.videoTrack as IRemoteVideoTrack).play("remote-video", {
                            fit: "contain",
                        });
                    }

                    if (mediaType === "audio" && user.audioTrack) {
                        (user.audioTrack as IRemoteAudioTrack).play();
                    }

                    setRemoteUsers(prev => prev.some(u => u.uid === user.uid) ? prev : [...prev, user]);
                });

                client.on("user-unpublished", (_user, mediaType) => {
                    if (mediaType === "video") {
                        const container = document.getElementById("remote-video");
                        if (container) container.innerHTML = "";
                    }
                });

                client.on("user-left", (user) => {
                    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
                    document.getElementById("remote-video")!.innerHTML = "";
                });

            } catch (err) {
                console.error(err);
                alert("Failed to join meeting");
            }
        };

        init();

        return () => {
            mounted = false;
            localAudioTrack.current?.close();
            localVideoTrack.current?.close();
            localScreenTrack.current?.close();
            clientRef.current?.leave();
        };
    }, [channelName, token, user?._id]);

    const toggleMic = async () => {
        const enabled = !isMicOn;
        if (!clientRef.current) return;
        if (!localAudioTrack.current && enabled) {
            try {
                const mic = await AgoraRTC.createMicrophoneAudioTrack();
                localAudioTrack.current = mic;
                await clientRef.current.publish(mic);
                setHasMic(true);
            } catch {
                setHasMic(false);
                return;
            }
        }
        if (localAudioTrack.current) {
            await localAudioTrack.current.setEnabled(enabled);
            setIsMicOn(enabled);
        }
    };

    const toggleCamera = async () => {
        const enabled = !isCameraOn;
        if (!clientRef.current) return;
        if (!localVideoTrack.current && enabled) {
            try {
                const cam = await AgoraRTC.createCameraVideoTrack();
                localVideoTrack.current = cam;
                cam.play("local-video");
                await clientRef.current.publish(cam);
                setHasCamera(true);
            } catch {
                setHasCamera(false);
                return;
            }
        }
        if (localVideoTrack.current) {
            await localVideoTrack.current.setEnabled(enabled);
            if (enabled) localVideoTrack.current.play("local-video");
            setIsCameraOn(enabled);
        }
    };

    const toggleScreenShare = async () => {
        if (!clientRef.current) return;

        if (isScreenSharing) {
            // Stop screen share
            localScreenTrack.current?.close();
            localScreenTrack.current = null;
            setIsScreenSharing(false);

            if (localVideoTrack.current) {
                localVideoTrack.current.play("local-video");
                await clientRef.current.publish(localVideoTrack.current);
            }
        } else {
            // Start screen share
            try {
                if (localVideoTrack.current) {
                    await clientRef.current.unpublish(localVideoTrack.current);
                    localVideoTrack.current.stop();
                }

                const screenTrack = await AgoraRTC.createScreenVideoTrack(
                    { encoderConfig: "1080p_1" },
                    "auto"
                );

                let videoTrack: ILocalVideoTrack;

                if (Array.isArray(screenTrack)) {
                    videoTrack = screenTrack[0];
                    await clientRef.current.publish(screenTrack);
                } else {
                    videoTrack = screenTrack;
                    await clientRef.current.publish(screenTrack);
                }

                localScreenTrack.current = videoTrack;
                videoTrack.play("local-video");
                setIsScreenSharing(true);
            } catch (err: any) {
                console.error("Screen share failed:", err);
                alert("Screen sharing failed: " + (err.message || "Permission denied"));

                if (localVideoTrack.current) {
                    localVideoTrack.current.play("local-video");
                    await clientRef.current.publish(localVideoTrack.current);
                }
            }
        }
    };

    const leaveMeeting = () => {
        localAudioTrack.current?.close();
        localVideoTrack.current?.close();
        localScreenTrack.current?.close();
        clientRef.current?.leave();
        window.location.href = "/";
    };

    const endMeetingForAll = async () => {
        if (!isHost) return alert("Only host can end the meeting");
        try {
            if (channelName) {
                await closeMeeting(channelName);
            }
        } catch (err) {
            console.error("Failed to close meeting:", err);
            alert("Failed to close meeting on server");
        } finally {
            leaveMeeting();
        }
    };

    return {
        isJoined,
        remoteUsers,
        remoteName,
        isHost,
        isMicOn,
        isCameraOn,
        hasMic,
        hasCamera,
        isScreenSharing,
        toggleMic,
        toggleCamera,
        toggleScreenShare,
        leaveMeeting,
        endMeetingForAll,
    };
}
