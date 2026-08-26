---
name: Audio player "track ended" callback must be stackable
description: Why multiple features (playlist auto-advance, album auto-advance) registering a single shared "onEnded" callback on the audio player broke playlists, and how it's fixed.
---

The shared audio player context (client/src/lib/audioPlayer.tsx) exposes a single `setOnEnded(cb | null)` registration point used by whichever feature wants to know when the current track finishes, so it can decide what plays next (e.g. the global playlist, or an album page's track order).

**Why this matters:** originally `setOnEnded` just overwrote one ref. Any component that registered its own handler on mount and cleared it with `setOnEnded(null)` on unmount would wipe out *any other* handler that was active before it — not just its own. Concretely: the playlist provider registers its auto-advance handler once at the app root; visiting an album page registered a second handler for in-album order and then nulled the ref entirely on leaving the page, permanently killing playlist auto-advance for the rest of the session.

**How to apply:** `setOnEnded` is now stack-based (push on register, pop on `null`, active handler = top of stack) so unregistering restores whatever was registered before it instead of clearing everything. When adding a new consumer of `setOnEnded` (or any similar single-ref "current handler" pattern shared across independent features), check whether nested/temporary registrations correctly restore the previous handler instead of clearing it.

Related fix at the same time: the playlist's "advance to next track" logic and "Play All" only looked at the immediate next array item and stopped silently if it had no `fileUrl`. Now they skip forward to the next track that actually has a file, so one track with a missing/broken audio file doesn't stall the whole playlist. Playback failures (`loadAndPlay` errors, rejected `play()` promises) also now trigger the same "advance" callback and show a toast, instead of silently leaving playback stuck.
