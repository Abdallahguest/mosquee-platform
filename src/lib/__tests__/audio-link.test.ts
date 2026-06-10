import { describe, it, expect } from "vitest"
import { isDirectAudioFile } from "../audio-link"

describe("isDirectAudioFile", () => {
  it("reconnaît les fichiers audio directs", () => {
    expect(isDirectAudioFile("https://x.com/a.mp3")).toBe(true)
    expect(isDirectAudioFile("https://x.com/voice.m4a")).toBe(true)
    expect(isDirectAudioFile("https://cdn.x.com/p/v.opus")).toBe(true)
  })
  it("ignore les paramètres de requête", () => {
    expect(isDirectAudioFile("https://x.com/a.mp3?token=123")).toBe(true)
  })
  it("gère la casse", () => {
    expect(isDirectAudioFile("https://x.com/A.MP3")).toBe(true)
  })
  it("rejette les pages (WhatsApp, YouTube, Drive)", () => {
    expect(isDirectAudioFile("https://youtube.com/watch?v=abc")).toBe(false)
    expect(isDirectAudioFile("https://chat.whatsapp.com/xyz")).toBe(false)
    expect(isDirectAudioFile("https://drive.google.com/file/d/abc/view")).toBe(false)
  })
  it("rejette les URL invalides ou vides", () => {
    expect(isDirectAudioFile("pas une url")).toBe(false)
    expect(isDirectAudioFile("")).toBe(false)
  })
})
