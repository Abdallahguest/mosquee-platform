import { describe, it, expect } from "vitest"
import { isDirectAudioFile, isAudioKeyOwnedByMosque } from "../audio-link"

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

describe("isAudioKeyOwnedByMosque", () => {
  it("accepte une clé de la bonne mosquée", () => {
    expect(isAudioKeyOwnedByMosque("mosques/42/audio/171-abcd1234.mp3", 42)).toBe(true)
  })
  it("refuse une clé appartenant à une autre mosquée", () => {
    expect(isAudioKeyOwnedByMosque("mosques/7/audio/171-abcd1234.mp3", 42)).toBe(false)
  })
  it("n'est pas trompé par un préfixe partiel (le / final protège 42 vs 420)", () => {
    expect(isAudioKeyOwnedByMosque("mosques/420/audio/x.mp3", 42)).toBe(false)
    expect(isAudioKeyOwnedByMosque("mosques/42x/audio/x.mp3", 42)).toBe(false)
  })
  it("refuse une clé hors du préfixe mosques/", () => {
    expect(isAudioKeyOwnedByMosque("autre/42/audio/x.mp3", 42)).toBe(false)
  })
  it("refuse null, undefined ou vide", () => {
    expect(isAudioKeyOwnedByMosque(null, 42)).toBe(false)
    expect(isAudioKeyOwnedByMosque(undefined, 42)).toBe(false)
    expect(isAudioKeyOwnedByMosque("", 42)).toBe(false)
  })
})
