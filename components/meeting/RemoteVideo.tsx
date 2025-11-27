export default function RemoteVideo({ remoteName }: { remoteName: string }) {
  return (
    <>
      <div id="remote-video" className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
        {remoteName}
      </div>
    </>
  );
}
