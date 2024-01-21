"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
}

interface RawSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

function url(term: string) {
  console.log(process.env.NEXT_PUBLIC_API_KEY as string);
  return `https://www.googleapis.com/youtube/v3/search?key=${
    process.env.NEXT_PUBLIC_API_KEY as string
  }&part=id,snippet&q=${term}`;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    fetch(url(searchTerm)).then((r) =>
      r.json().then((j) => {
        const result = j.items.map((vid: RawSearchResult) => {
          return {
            id: vid.id.videoId,
            title: vid.snippet.title,
            thumbnail: vid.snippet.thumbnails.high.url,
          } as VideoMetadata;
        });
        setSearchResults(result);
      })
    );
  };

  const [playingUrl, setPlayingUrl] = React.useState("");
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="border-4 h-full flex flex-col justify-center items-center">
      <div className="w-1/2 flex flex-col gap-4">
        <form className="flex w-full items-center gap-2" onSubmit={onSearch}>
          <Input
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
        {searchResults.map((result: VideoMetadata) => {
          return (
            <div
              className="flex w-full items-center gap-4"
              key={result.id}
              onClick={() => {
                setPlayingUrl(result.id);
                setPlaying(true);
              }}
            >
              <img
                width={180}
                height={120}
                src={result.thumbnail}
                alt="thumbnail"
              ></img>
              <div className="text-lg">{result.title}</div>
            </div>
          );
        })}
      </div>
      <Dialog open={playing} onOpenChange={setPlaying}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          className="max-w-full w-[1080px] h-[720px] p-0 border-0"
        >
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${playingUrl}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </DialogContent>
      </Dialog>
    </div>
  );
}
