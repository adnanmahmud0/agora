export default function MeetingStatus({
  isJoined,
  totalUsers,
}: {
  isJoined: boolean;
  totalUsers: number;
}) {
  return (
    <div className="bg-black/60 text-center py-2 text-sm">
      {isJoined ? "Connected" : "Connecting..."} • {totalUsers} in call
    </div>
  );
}
