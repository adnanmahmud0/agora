import axiosPrivate from "@/utils/axiosPrivate";

export type MeetingType = "instant" | "scheduled";

export interface CreateMeetingRequestBase {
  participantId: string;
  meetingType: MeetingType;
  title: string;
}

export interface CreateMeetingRequestInstant extends CreateMeetingRequestBase {
  meetingType: "instant";
}

export interface CreateMeetingRequestScheduled extends CreateMeetingRequestBase {
  meetingType: "scheduled";
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export type CreateMeetingRequest =
  | CreateMeetingRequestInstant
  | CreateMeetingRequestScheduled;

export interface CreateMeetingResponseData {
  id: string;
  joinLink: string;
  meetingType: MeetingType;
}

export interface CreateMeetingResponse {
  success: boolean;
  message: string;
  data: CreateMeetingResponseData;
}

export const createMeeting = async (
  payload: CreateMeetingRequest
): Promise<CreateMeetingResponseData> => {
  const res = await axiosPrivate.post<CreateMeetingResponse>(
    "/meetings/create-meeting",
    payload
  );
  return res.data.data;
};

export interface MyMeetingsResponse {
  success: boolean;
  message: string;
  data: {
    meetings: Array<{
      creator: { id: string; name: string; email: string };
      participant: { id: string; name: string; email: string };
      meetingType: MeetingType;
      startTime: string | null;
      endTime: string | null;
      roomId: string;
      joinLink: string;
      status: "ongoing" | "completed" | "scheduled";
    }>;
  };
}

export const fetchMyMeetings = async () => {
  const res = await axiosPrivate.get<MyMeetingsResponse>("/meetings/my-meetings");
  return res.data.data.meetings;
};

export const closeMeeting = async (roomId: string): Promise<void> => {
  await axiosPrivate.patch(`/meetings/${roomId}/close`);
};

export const deleteMeeting = async (roomId: string): Promise<void> => {
  await axiosPrivate.delete(`/meetings/${roomId}`);
};

export interface JoinMeetingResponse {
  success: boolean;
  message: string;
  data: { token: string; channelName: string };
}

export const joinMeeting = async (
  roomId: string
): Promise<{ token: string; channelName: string }> => {
  const res = await axiosPrivate.get<JoinMeetingResponse>(`/meetings/join/${roomId}`);
  return res.data.data;
};
