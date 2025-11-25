import { NextRequest } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelName, uid } = body as { channelName: string; uid?: number };

    const appID = process.env.AGORA_APP_ID as string;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE as string;

    if (!appID || !appCertificate) {
      return Response.json(
        { success: false, message: "Server is missing AGORA credentials" },
        { status: 500 }
      );
    }

    if (!channelName) {
      return Response.json(
        { success: false, message: "channelName is required" },
        { status: 400 }
      );
    }

    const role = RtcRole.PUBLISHER;
    const expireSeconds = 60 * 60; // 1 hour
    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid ?? 0,
      role,
      privilegeExpireTs
    );

    return Response.json({
      success: true,
      message: "Token generated successfully",
      data: { token, channelName },
    });
  } catch (e) {
    return Response.json(
      { success: false, message: (e as Error)?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}

