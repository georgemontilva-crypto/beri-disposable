/**
 * Fan-card hero.
 *
 * Four product cards splayed in an arc; hovering one straightens it, lifts it
 * and brings it to the front. The overshoot easing is what sells the effect —
 * the card travels past its resting position and settles back.
 *
 * Layout notes:
 *  - The fan is absolutely positioned and only runs at md+. Four rotated
 *    240px cards need ~900px to read as an arc; below that they collapse into
 *    an unreadable stack, so small screens get a plain scrollable row instead.
 *  - The background image is optional and sits under a scrim so the headline
 *    stays legible whatever the client uploads.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ParallaxBanner, { type ParallaxLayer } from "./ParallaxBanner";
import { PRODUCTS } from "@/lib/products";
import { useEffect, useState } from "react";
import { Link } from "wouter";

/** Resting position of each card in the arc, in DOM order. */
const FAN = [
  { tx: -279, ty: 44, rot: -12, z: 10 },
  { tx: -93, ty: 0, rot: -4, z: 20 },
  { tx: 93, ty: 2, rot: 4, z: 30 },
  { tx: 279, ty: 46, rot: 12, z: 20 },
];

/** Back to front. Speeds are far apart so the stack reads as depth. */
const HERO_LAYERS: ParallaxLayer[] = [
  { slot: "hero_layer_back", mobileSlot: "hero_layer_back_mobile", speed: 0.15 },
  { slot: "hero_layer_mid", mobileSlot: "hero_layer_mid_mobile", speed: 0.45 },
  { slot: "hero_layer_front", mobileSlot: "hero_layer_front_mobile", speed: 0.9 },
];

export default function HeroFan() {
  const media = useSiteImages();
  const settings = useSiteSettings();

  const hasLayers = HERO_LAYERS.some(
    (l) => media[l.slot]?.url || (l.mobileSlot && media[l.mobileSlot]?.url)
  );
  const heroMode = settings.home_hero_mode ?? "auto";
  // "auto" lets uploading a layer switch the hero on its own; an explicit
  // choice keeps both sets uploaded while only one is shown.
  const useLayers =
    heroMode === "layers" || (heroMode === "auto" && hasLayers);

  const bg = media["home_hero_bg"];
  const videoDesktop = media["home_hero_video"]?.url;
  const videoMobile = media["home_hero_video_mobile"]?.url;

  // Pick the cut in JS rather than with <source media="...">: browsers only
  // evaluate those once, so a resize or an orientation change would keep the
  // wrong file. Phones also shouldn't download the desktop cut at all.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const videoUrl = (isPhone ? videoMobile : videoDesktop) ?? videoDesktop ?? videoMobile;
  const [videoReady, setVideoReady] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // A source swap — rotating a tablet across the breakpoint, or the admin
  // replacing the file — restarts playback, so the frozen state has to clear or
  // the new video would play underneath a paused float.
  useEffect(() => {
    setVideoEnded(false);
    setVideoReady(false);
  }, [videoUrl]);

  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white">
      {useLayers ? (
        /* Layered banner instead of the video, with its own drop-in, float and
           scroll parallax. */
        <ParallaxBanner layers={HERO_LAYERS} className="absolute inset-0" />
      ) : (
      <>
      {/*
        Entrance and settle live on two nested wrappers, not on the media
        itself: the drop is a one-shot animation with `both` fill and the float
        is an infinite loop, and both drive `transform`. On one element the
        infinite one would simply overwrite the other's final value.

        The base scale sits above 1 so neither the drop's overshoot nor the
        float's travel can ever expose the edges of a cover-fitted video.
      */}
      <div className="hero-drop absolute inset-0">
          {/*
            The float is frozen once the video holds its last frame. Left
            running, a slow scale over a still image doesn't read as breathing —
            it reads as a wobble, and scaling a paused video keeps nudging it
            across subpixel boundaries, which shows up as a shimmer.

            Paused rather than removed: dropping the class would snap the
            transform back to its resting value and jolt the frame.
          */}
          <div
            className="hero-float absolute inset-0"
            style={videoEnded ? { animationPlayState: "paused" } : undefined}
          >
      {/* Still background: paints immediately, and stays as the fallback for
              devices that block autoplay or fail to load the video. */}
          {bg?.url && (
            <img
              src={bg.url}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                videoReady ? "opacity-0" : "opacity-100"
              }`}
            />
          )}

          {/* Looping background animation. role="img" with no controls: it is
              decoration, not media the visitor is meant to operate. */}
          {videoUrl && (
            <video
              key={videoUrl}
              src={videoUrl}
              poster={bg?.url}
              autoPlay
              muted
              playsInline
              preload="auto"
              role="img"
              aria-hidden="true"
              tabIndex={-1}
              onCanPlay={() => setVideoReady(true)}
              onEnded={(e) => {
                // Pause only. Seeking here — even to a point just short of the
                // end — makes the browser decode and settle onto another
                // frame, which shows up as a twitch on an otherwise still
                // image. A paused video already holds its final frame.
                e.currentTarget.pause();
                // Stops the float. Without this the frozen frame keeps being
                // scaled up and down, which reads as a wobble.
                setVideoEnded(true);
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </div>

      </>
      )}

      {/* No scrim over video: the animation is the hero, and any wash on top
          would mute the colours it was graded for. The still-image case keeps a
          light vignette so the cards don't sit on a flat photo. */}
      {!videoUrl && !useLayers && (
        <div
          className="absolute inset-0"
          style={{
            background: bg?.url
              ? "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.2) 45%, rgba(10,10,10,0.8) 100%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      <div
        className="container relative z-10 flex flex-col items-center justify-center"
        style={{
          // The header overlays the hero, so reserve its height at the top:
          // the video runs behind the glass but the cards must not.
          paddingTop: "var(--header-h, 96px)",
          // Full viewport height. dvh rather than vh so mobile browsers measure
          // the visible area instead of the taller layout viewport, which on
          // iOS Safari would push the bottom of the hero under the URL bar.
          minHeight: "100dvh",
        }}
      >
        {/*
          The video carries the message, so the headline is visually removed but
          kept for assistive tech and search engines — a page with no h1 at all
          reads as untitled to both.
        */}
        <h1 className="sr-only">Beri Disposable — Crush, Cliq, Cirql and E-Liquid</h1>

      </div>
    </section>
  );
}
