/* eslint-disable @typescript-eslint/no-explicit-any */
import LocalVideo from "./LocalVideo";
import RemoteVideo from "./RemoteVideo";


interface Props {
  remoteUsers: any[];
  remoteName: string;
}

export default function VideoGrid({ remoteUsers, remoteName }: Props) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Remote */}
      <div className="lg:col-span-3 relative bg-black rounded-2xl overflow-hidden">
        {remoteUsers.length === 0 ? (
          <div className="flex h-full items-center justify-center text-2xl text-gray-400">
            Waiting for participant...
          </div>
        ) : (
          <RemoteVideo remoteName={remoteName} />
        )}
      </div>

      {/* Local */}
      <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-blue-500">
        <LocalVideo />
      </div>
    </div>
  );
}
