import { Statistics } from "./Statistics";
import shop from "../assets/VS-Store.png";

export const About = () => {
  return (
    <section id="about" className="container py-24 sm:py-32">
      <div
        className="relative border rounded-lg py-24 overflow-hidden"
        style={{
          backgroundImage: `url(${shop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60" />

        {/* content */}
        <div className="relative flex flex-col items-center text-center text-white px-6 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              About{" "}
            </span>
            Us
          </h2>

          <p className="text-xl text-white/95 mt-6">
            Welcome to Riebeek Valley Computers (Pty) Ltd, your trusted local
            partner for computer repairs, IT support, and internet solutions in
            the heart of Riebeeck-Kasteel. <br /> <br /> We specialise in helping individuals
            and small businesses with reliable, honest tech support — from
            laptop and desktop repairs to network setup, troubleshooting, and
            ongoing IT assistance. <br /> <br /> Our goal is simple: make technology easy,
            affordable, and stress-free.
          </p>

          <div className="mt-10 w-full">
            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
