import { useAuth } from "@/lib/auth/AuthContext";

export default function LocalVideo() {
  const { user } = useAuth();

  return (
    <>
      <div id="local-video" className="w-full h-full" />

      <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded">
        You {user?.name && `(${user.name})`}
      </div>
    </>
  );
}
