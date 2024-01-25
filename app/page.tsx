"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
}

interface RawSearchResult {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

const NUM_RESULTS = 10;
const NUM_VIDEOS = 5;

function fetchVideos(term: string) {
  const key = process.env.NEXT_PUBLIC_API_KEY as string;
  const url = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${term}&maxResults=${NUM_RESULTS}&key=${key}`;
  return fetch(url);
}

function parseTitle(title: string): string {
  let txt = document.createElement("textarea");
  txt.innerHTML = title;
  return txt.value;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);

  const [videoId, setVideoId] = React.useState("");

  const params =
    typeof window !== "undefined"
      ? new URL(document.location.toString()).searchParams
      : undefined;
  const play = params?.get("play");

  React.useEffect(() => {
    if (play) {
      setVideoId(play);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    fetchVideos(searchTerm).then((r) =>
      r.json().then((j) => {
        const result = j.items
          .filter((vid: RawSearchResult) => {
            return vid.id.kind == "youtube#video";
          })
          .slice(0, NUM_VIDEOS)
          .map((vid: RawSearchResult) => {
            return {
              id: vid.id.videoId,
              title: parseTitle(vid.snippet.title),
              thumbnail: vid.snippet.thumbnails.medium.url,
            } as VideoMetadata;
          });
        setSearchResults(result);
      }),
    );
  };

  const playPause = (id?: string) => {
    const path = `${location.pathname}` + (id ? `?play=${id}` : "");
    history.pushState({}, "", path);
    setVideoId(id ?? "");
  };

  const searchFieldRef = React.useRef<HTMLInputElement>(null);
  const resultFieldRef = React.useRef<[HTMLDivElement | null]>([null]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (document.activeElement === searchFieldRef.current) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchFieldRef.current && searchFieldRef.current.focus();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        playPause();
        return;
      }

      for (let i = 0; i < NUM_VIDEOS; i++) {
        if (resultFieldRef.current.at(i) === document.activeElement) {
          if (e.key === "j") {
            e.preventDefault();
            if (i !== NUM_VIDEOS - 1) {
              resultFieldRef.current.at(i + 1)?.focus();
            } else {
              resultFieldRef.current.at(0)?.focus();
            }
            return;
          }

          if (e.key === "k") {
            e.preventDefault();
            if (i !== 0) {
              resultFieldRef.current.at(i - 1)?.focus();
            } else {
              resultFieldRef.current.at(NUM_VIDEOS - 1)?.focus();
            }
            return;
          }
        }
      }

      if (e.key === "j") {
        e.preventDefault();
        resultFieldRef.current.at(0)?.focus();
        return;
      }

      if (e.key === "k") {
        e.preventDefault();
        resultFieldRef.current.at(NUM_VIDEOS - 1)?.focus();
        return;
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex h-fit min-h-full w-full flex-col items-center justify-start gap-8 pb-8">
      <div className="px-8">
        <div className="font-mono text-4xl text-primary">Just Watch It</div>
        <div className="font-mono">
          Search and watch YouTube videos. No more. No less.
        </div>
      </div>
      <div className="flex w-full flex-col gap-4 px-8 sm:w-3/4 lg:w-1/2">
        <form className="flex w-full items-center gap-2" onSubmit={onSearch}>
          <Input
            ref={searchFieldRef}
            autoFocus
            className="w-full"
            type="text"
            placeholder="Search for a video..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <Button className="flex-shrink" type="submit">
            Search
          </Button>
        </form>
        <div className="h-4"></div>
        <div className="flex flex-col gap-8">
          {searchResults.map((result: VideoMetadata, i: number) => {
            return (
              <div
                ref={(el) => (resultFieldRef.current[i] = el)}
                tabIndex={0}
                className="flex w-full cursor-pointer flex-col items-center gap-x-4 gap-y-2 border-b-2 border-b-transparent transition duration-150 hover:border-b-2 hover:border-b-primary focus:rounded focus:outline focus:outline-primary md:flex-row"
                key={result.id}
                onClick={() => playPause(result.id)}
                onKeyDown={(e) =>
                  e.key === "Enter" ? e.currentTarget.click() : false
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={180}
                  src={result.thumbnail}
                  alt={`Thumbnail ${result.title}`}
                ></img>
                <div className="text-lg">{result.title}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Dialog
        open={Boolean(videoId)}
        onOpenChange={(v) => {
          if (!v) {
            playPause();
          }
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          className="aspect-video max-w-full border-0 p-0 md:w-2/3 lg:w-3/5"
        >
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&iv_load_policy=3&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </DialogContent>
      </Dialog>
    </div>
  );
}
