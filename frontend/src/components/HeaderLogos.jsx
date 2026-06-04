import iitTirupatiLogo from "./iittirupati.png";
import iittnifLogo from "./IITTNiF logo.png";
import makeInIndiaLogo from "./make_in_india_logo.png";

const logos = [
  { src: iitTirupatiLogo, alt: "IIT Tirupati" },
  { src: iittnifLogo, alt: "IIT Tirupati Navavishkār I-Hub Foundation" },
  { src: makeInIndiaLogo, alt: "Make in India" },
];

export default function HeaderLogos() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
      {logos.map(({ src, alt }) => (
        <img
          key={alt}
          src={src}
          alt={alt}
          className="h-8 w-auto max-w-[5.5rem] object-contain sm:h-9 sm:max-w-none md:h-10"
        />
      ))}
    </div>
  );
}
