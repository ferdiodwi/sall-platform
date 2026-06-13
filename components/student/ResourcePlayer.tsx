'use client'

import { useState } from 'react'
import { Video, AudioLines, FileText, Download, Play, Music, ExternalLink } from 'lucide-react'

interface Resource {
  id: string
  type: 'video' | 'audio' | 'worksheet' | 'reading' | 'pdf' | 'docx' | 'pptx'
  title: string
  url: string
  format?: string | null
  meta?: any | null
}

interface ResourcePlayerProps {
  resources: Resource[]
}

export default function ResourcePlayer({ resources }: ResourcePlayerProps) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm text-gray-500 font-medium">
        Tidak ada materi tambahan (Free Resources) untuk modul ini.
      </div>
    )
  }

  // Parse embed video URL untuk youtube/drive
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url // Default raw URL (misal Google Drive embed url)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Video Modal / Player Block jika ada video aktif */}
      {activeVideoUrl && (
        <div className="bg-black rounded-2xl overflow-hidden aspect-video border border-rose-100/50 shadow-md relative animate-fade-in">
          <iframe
            src={getEmbedUrl(activeVideoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <button
            onClick={() => setActiveVideoUrl(null)}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full select-none"
          >
            Tutup Pemutar Video
          </button>
        </div>
      )}

      {/* Grid List of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => {
          const isVideo = resource.type === 'video'
          const isAudio = resource.type === 'audio'
          const isDoc = ['pdf', 'docx', 'pptx', 'worksheet', 'reading'].includes(resource.type)

          const fileSize = resource.meta?.fileSize || resource.meta?.size || ''
          const duration = resource.meta?.duration || ''

          return (
            <div
              key={resource.id}
              className="bg-white p-5 rounded-2xl border border-rose-100/60 shadow-sm hover:shadow hover:border-rose-100 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Icon & Type */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5
                    ${isVideo ? 'bg-red-50 text-red-600 border-red-100' : ''}
                    ${isAudio ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                    ${isDoc ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                  `}
                  >
                    {isVideo && <Video size={14} />}
                    {isAudio && <AudioLines size={14} />}
                    {isDoc && <FileText size={14} />}
                    <span className="capitalize">{resource.type}</span>
                  </span>
                  
                  {/* File specs */}
                  <span className="text-xs text-gray-400 font-medium">
                    {duration ? `${duration} mnt` : fileSize ? `${fileSize}` : ''}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-gray-800 text-sm md:text-base leading-snug mb-3">
                  {resource.title}
                </h4>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-rose-50/50 flex justify-end">
                {isVideo && (
                  <button
                    onClick={() => setActiveVideoUrl(resource.url)}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors"
                  >
                    <Play size={12} fill="currentColor" />
                    Putar Video
                  </button>
                )}

                {isAudio && (
                  <div className="w-full flex flex-col gap-2">
                    <audio src={resource.url} controls className="w-full h-8 rounded-lg bg-gray-50" />
                  </div>
                )}

                {isDoc && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={12} />
                    Unduh File
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
