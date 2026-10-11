import { FilmFrame } from "@/components/pages/FilmFrame";

export type FilmSpec = { src: string; aspectClassName?: string; ariaLabel: string };

/**
 * Two-column film module: one or more height-pinned portrait clips on one side,
 * page content on the other. Height-pinned rather than width-pinned so a 9:16
 * source stays a supporting note beside the copy instead of taking over the
 * page. Only the first clip carries the sound toggle — two audio tracks playing
 * over each other is never what anyone wants.
 */
export function FilmPanel({
  films,
  sound,
  soundLabels,
  reverse = false,
  frameClassName = "h-64 sm:h-80 lg:h-[26rem]",
  className = "",
  children,
}: {
  films: FilmSpec[];
  sound?: boolean;
  soundLabels?: { unmute: string; mute: string };
  /** Put the clips on the right from `sm` up. */
  reverse?: boolean;
  frameClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      className={`flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10 lg:gap-16 ${
        reverse ? "sm:flex-row-reverse" : ""
      } ${className}`}
    >
      {/* self-start keeps the aspect boxes from stretching to full width while
          the panel is stacked; the row re-centres once the columns split. */}
      <div className="flex shrink-0 items-start gap-3 self-start sm:gap-4 sm:self-center">
        {films.map((film, index) => (
          <FilmFrame
            key={film.src}
            src={film.src}
            aspectClassName={film.aspectClassName}
            ariaLabel={film.ariaLabel}
            sound={sound && index === 0}
            soundLabels={soundLabels}
            // Dropped shoulder on the later clips, so a pair reads as one
            // montage rather than two panes of the same height.
            className={`w-auto ${frameClassName} ${index > 0 ? "mt-6 sm:mt-10" : ""}`}
          />
        ))}
      </div>

      <figcaption className="min-w-0 flex-1">{children}</figcaption>
    </figure>
  );
}
