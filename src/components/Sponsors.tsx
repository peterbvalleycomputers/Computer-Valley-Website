import ubiquiti from "@/assets/logos/Ubicwity.png";
import tenda from "@/assets/logos/tenda.png";
import tplink from "@/assets/logos/TP-Link.png";
import mikrotik from "@/assets/logos/mikroTik.png";
import dell from "@/assets/logos/dell.png";
import hp from "@/assets/logos/hp.png";

interface SponsorProps {
  logo: string;
  name: string;
}

const sponsors: SponsorProps[] = [
  { logo: ubiquiti, name: "Ubiquiti" },
  { logo: tenda, name: "Tenda" },
  { logo: tplink, name: "TP-Link" },
  { logo: mikrotik, name: "MikroTik" },
  { logo: dell, name: "Dell" },
  { logo: hp, name: "HP" },
];

export const Sponsors = () => {
  return (
    <section id="sponsors" className="container pt-24 sm:py-32">
      <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 text-primary">
        Our Trusted Partners
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
        {sponsors.map(({ logo, name }, i) => (
          <div
            key={i}
            className="
              flex items-center justify-center
              bg-white/5 backdrop-blur
              w-32 h-24
              rounded-xl shadow-sm
              hover:bg-white/10 transition
            "
          >
            <img
              src={logo}
              alt={name}
              className={`h-10 object-contain transition ${
                name === "Tenda" ? "scale-100" : "scale-125"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
