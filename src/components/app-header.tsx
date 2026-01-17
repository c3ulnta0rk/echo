import { FileTranscriptionCenter } from "@/components/file-transcription-center";

export function AppHeader() {
  return (
    <div className="fixed top-0 right-0 z-30 flex items-center gap-2 p-2">
      <FileTranscriptionCenter />
    </div>
  );
}
