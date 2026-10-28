import { useCallback, useEffect, useRef, useState } from 'react'

import {
  fetchSpeechAudio,
  SPEECH_GENERIC_ERROR_MESSAGE,
  SpeechApiError,
} from '../services/api'
import type { SpeakingRate } from '../types/translation'

export type SpeechStatus = 'idle' | 'loading' | 'playing'

export interface SpeechController {
  activeId: string | null
  status: SpeechStatus
  error: string | null
  toggle: (id: string, text: string, speakingRate: SpeakingRate) => void
  stop: () => void
}

/**
 * Plays one German audio clip at a time. Starting a new clip, or toggling
 * the active one, cancels any in-flight request and releases the audio.
 */
export function useSpeech(): SpeechController {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const release = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    release()
    setActiveId(null)
    setStatus('idle')
  }, [release])

  useEffect(() => release, [release])

  const toggle = useCallback(
    (id: string, text: string, speakingRate: SpeakingRate) => {
      const isActive = controllerRef.current !== null && activeId === id
      release()
      setError(null)
      if (isActive) {
        setActiveId(null)
        setStatus('idle')
        return
      }

      const controller = new AbortController()
      controllerRef.current = controller
      setActiveId(id)
      setStatus('loading')

      const fail = (message: string) => {
        release()
        setActiveId(null)
        setStatus('idle')
        setError(message)
      }

      void (async () => {
        try {
          const blob = await fetchSpeechAudio(
            { text, speakingRate },
            controller.signal,
          )
          if (controller.signal.aborted) {
            return
          }
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          urlRef.current = url
          audioRef.current = audio
          audio.onended = stop
          audio.onerror = () => fail(SPEECH_GENERIC_ERROR_MESSAGE)
          await audio.play()
          if (!controller.signal.aborted) {
            setStatus('playing')
          }
        } catch (requestError) {
          if (controller.signal.aborted) {
            return
          }
          fail(
            requestError instanceof SpeechApiError
              ? requestError.message
              : SPEECH_GENERIC_ERROR_MESSAGE,
          )
        }
      })()
    },
    [activeId, release, stop],
  )

  return { activeId, status, error, toggle, stop }
}
