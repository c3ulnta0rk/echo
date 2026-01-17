import { listen } from "@tauri-apps/api/event";
import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
  addFileTranscriptionAtom,
  updateFileTranscriptionAtom,
} from "@/lib/atoms/file-transcription-atoms";

interface FileTranscriptionProgress {
  status: string;
  progress: number;
  message: string;
  fileName?: string;
}

interface TranscriptionCompletePayload {
  text: string;
  fileName: string;
}

export function useFileTranscriptionListener() {
  const addTranscription = useSetAtom(addFileTranscriptionAtom);
  const updateTranscription = useSetAtom(updateFileTranscriptionAtom);
  const currentTranscriptionId = useRef<string | null>(null);
  const lastCompletedTranscriptionId = useRef<string | null>(null);

  useEffect(() => {
    const unlisten: (() => void)[] = [];

    const setupListeners = async () => {
      unlisten.push(
        await listen<FileTranscriptionProgress>(
          "file-transcription-progress",
          (event) => {
            const { status, progress, message, fileName } = event.payload;

            if (status === "decoding" && !currentTranscriptionId.current) {
              const id = `${Date.now()}-${Math.random()}`;
              addTranscription({
                id,
                fileName: fileName || "Unknown file",
                status: "processing",
                progress,
                message,
                timestamp: Date.now(),
              });
              currentTranscriptionId.current = id;
            } else if (currentTranscriptionId.current) {
              if (status === "complete") {
                updateTranscription({
                  id: currentTranscriptionId.current,
                  updates: {
                    status: "complete",
                    progress: 1.0,
                    message,
                  },
                });
                lastCompletedTranscriptionId.current = currentTranscriptionId.current;
                currentTranscriptionId.current = null;
              } else {
                updateTranscription({
                  id: currentTranscriptionId.current,
                  updates: {
                    progress,
                    message,
                  },
                });
              }
            }
          }
        )
      );

      unlisten.push(
        await listen<TranscriptionCompletePayload>(
          "transcription-complete",
          (event) => {
            const id =
              currentTranscriptionId.current ??
              lastCompletedTranscriptionId.current;

            if (!id) {
              return;
            }

            updateTranscription({
              id,
              updates: {
                status: "complete",
                progress: 1.0,
                message: "Transcription complete!",
                text: event.payload.text,
              },
            });

            currentTranscriptionId.current = null;
            lastCompletedTranscriptionId.current = null;
          }
        )
      );

      unlisten.push(
        await listen<string>("file-transcription-error", (event) => {
          if (currentTranscriptionId.current) {
            updateTranscription({
              id: currentTranscriptionId.current,
              updates: {
                status: "error",
                message: "Transcription failed",
                error: event.payload,
              },
            });
            currentTranscriptionId.current = null;
          } else {
            const id = `${Date.now()}-${Math.random()}`;
            addTranscription({
              id,
              fileName: "Unknown file",
              status: "error",
              progress: 0,
              message: "Transcription failed",
              error: event.payload,
              timestamp: Date.now(),
            });
          }
        })
      );
    };

    setupListeners();

    return () => {
      for (const fn of unlisten) {
        fn();
      }
    };
  }, [addTranscription, updateTranscription]);
}
