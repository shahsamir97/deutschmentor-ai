import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ExampleSentences } from './ExampleSentences'
import { SpeakerButton } from './SpeakerButton'
import { TranslationResult } from './TranslationResult'
import { useSpeech } from '../hooks/useSpeech'

const fetchMock = vi.fn()
const audioInstances: FakeAudio[] = []

class FakeAudio {
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  pause = vi.fn()
  play = vi.fn(() => Promise.resolve())
  src: string
  constructor(src: string) {
    this.src = src
    audioInstances.push(this)
  }
}

function audioResponse(status = 200) {
  return new Response(status === 200 ? 'mp3' : null, {
    headers: { 'Content-Type': 'audio/mpeg' },
    status,
  })
}

function Harness({ texts }: { texts: string[] }) {
  const speech = useSpeech()
  return (
    <>
      {texts.map((text, index) => (
        <SpeakerButton id={`t${index}`} key={text} speech={speech} text={text} />
      ))}
      {speech.error && <p role="alert">{speech.error}</p>}
    </>
  )
}

beforeEach(() => {
  audioInstances.length = 0
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('Audio', FakeAudio)
  URL.createObjectURL = vi.fn(() => 'blob:audio')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('speech playback', () => {
  it('requests audio with the chosen rate and plays it', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(audioResponse()))
    render(<Harness texts={['Guten Tag']} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Listen in German, slowly' }),
    )

    await waitFor(() => expect(audioInstances[0]?.play).toHaveBeenCalled())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      text: 'Guten Tag',
      speakingRate: 0.85,
    })
  })

  it('stops the previous clip before playing another', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(audioResponse()))
    render(<Harness texts={['Eins', 'Zwei']} />)
    const buttons = screen.getAllByRole('button', { name: 'Listen in German' })

    await userEvent.click(buttons[0])
    await waitFor(() => expect(audioInstances).toHaveLength(1))
    await userEvent.click(buttons[1])
    await waitFor(() => expect(audioInstances).toHaveLength(2))

    expect(audioInstances[0].pause).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:audio')
  })

  it('shows an error when the API fails', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(audioResponse(429)))
    render(<Harness texts={['Hallo']} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Listen in German' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many audio requests',
    )
    expect(audioInstances).toHaveLength(0)
  })

  it('releases audio on unmount', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(audioResponse()))
    const { unmount } = render(<Harness texts={['Hallo']} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Listen in German' }),
    )
    await waitFor(() => expect(audioInstances).toHaveLength(1))

    unmount()

    expect(audioInstances[0].pause).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('disables the buttons for text over the limit', () => {
    render(<Harness texts={['a'.repeat(501)]} />)

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })
})

describe('speaker button placement', () => {
  const speech = {
    activeId: null,
    status: 'idle' as const,
    error: null,
    toggle: vi.fn(),
    stop: vi.fn(),
  }
  const response = {
    translatedText: 'Good morning',
    germanText: 'Guten Morgen',
    correction: null,
  }

  it('never shows speaker buttons on the English translation', () => {
    render(
      <TranslationResult
        direction="de-en"
        isLoading={false}
        onApplySuggestion={vi.fn()}
        response={response}
        speech={speech}
      />,
    )

    const englishHeading = screen.getByText('English translation')
    expect(englishHeading.parentElement?.querySelector('button')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('shows speaker buttons on the German translation', () => {
    render(
      <TranslationResult
        direction="en-de"
        isLoading={false}
        onApplySuggestion={vi.fn()}
        response={{ ...response, translatedText: 'Guten Morgen' }}
        speech={speech}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('shows speaker buttons on both generated examples', () => {
    render(
      <ExampleSentences
        germanText="Termin"
        onGenerate={vi.fn()}
        speech={speech}
        state={{
          status: 'success',
          sentences: [
            { german: 'Ich habe einen Termin.', translation: 'I have one.' },
            { german: 'Hast du Zeit?', translation: 'Do you have time?' },
          ],
        }}
      />,
    )

    expect(
      screen.getAllByRole('button', { name: 'Listen in German' }),
    ).toHaveLength(2)
  })
})
