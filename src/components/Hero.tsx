import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { FaWhatsapp } from "react-icons/fa";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Valley Computers
            </span>{" "}
            Your Local Tech & Internet Experts
          </h1>{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text"></span>{" "}
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Computers, repairs, internet services and professional installations —
          keeping you connected.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          {/* Call = outline */}
          <Button asChild variant="outline" className="w-full md:w-1/3">
            <a href="tel:+27799381260">Call Now</a>
          </Button>

          {/* WhatsApp = solid */}
          <a
            href="https://wa.me/27799381260"
            target="_blank"
            rel="noreferrer noopener"
            className={`w-full md:w-1/3 ${buttonVariants()}`}
          >
            WhatsApp Us
            <FaWhatsapp className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
