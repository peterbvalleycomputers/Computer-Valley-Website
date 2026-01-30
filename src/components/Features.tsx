import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import image from "../assets/signal.png";
import image3 from "../assets/Installations.jpg";
import image4 from "../assets/looking-ahead.jpg";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "IT Support / Technical Assistance",
    description:
      "Practical help for hardware, software, and everyday IT issues, without unnecessary complexity.",
    image: image4,
  },
  {
    title: "Internet Installations & Setup",
    description:
      "End-to-end internet installations, including planning, setup, and testing to ensure fast, stable connections from day one.",
    image: image3,
  },
  {
    title: "Connectivity Troubleshooting",
    description:
      "We identify and resolve slow speeds, signal drops, and network problems to keep you reliably online.",
    image: image,
  },
];

const featureList: string[] = [
  "Internet Installations & Setup",
  "Connectivity Troubleshooting",
  "On-Site Technical Support",
  "Upgrades & Optimisation",
  "Custom Solutions",
  "Local & Accessible",
  "Personal, Friendly Service",
  "Fast Turnaround",
  "Trusted by the Community",
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Core{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card
            key={title}
            className="relative overflow-hidden bg-cover bg-center text-white"
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative z-10">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent>{description}</CardContent>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
