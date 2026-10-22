import clsx from "clsx";

// No photography is available for this demo, so each panel stands in with a
// photographic-feeling duotone gradient from the same burgundy/stone/ink
// palette used everywhere else, rather than an icon, illustration or card.
const GRADIENTS = [
  "linear-gradient(135deg, #58101c 0%, #231f1c 100%)",
  "linear-gradient(135deg, #7c1f1f 0%, #450d16 100%)",
  "linear-gradient(135deg, #a8928a 0%, #58101c 100%)",
  "linear-gradient(135deg, #231f1c 0%, #6e1423 100%)",
  "linear-gradient(135deg, #cfc8bd 0%, #7c1f1f 100%)",
];

export function ImagePanel({
  index,
  caption,
  meta,
  className,
  minHeight = 260,
}: {
  index: number;
  caption: string;
  meta?: string;
  className?: string;
  minHeight?: number;
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  return (
    <div
      className={clsx("relative overflow-hidden", className)}
      style={{ background: gradient, minHeight }}
      role="img"
      aria-label={caption}
    >
      <span className="label-eyebrow absolute left-4 top-4 text-ivory/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="font-serif text-xl text-ivory">{caption}</p>
        {meta && <p className="label-eyebrow mt-1 text-ivory/80">{meta}</p>}
      </div>
    </div>
  );
}
