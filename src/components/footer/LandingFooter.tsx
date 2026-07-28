"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../sectionComponants";
import { footerData } from "./footerdata";

const LandingFooter = () => {
  const pathName = usePathname();
  if (pathName === "/thank-you/") {
    return null;
  }
  return (
    <footer className="max_screen_width bg-background-dark text-white">
      <Container>
        <div className="grid md:py-14 py-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_.7fr_.5fr] gap-12 md:gap-16">
          <div className=" flex flex-col w-full lg:max-w-xl gap-6">
            <div
              className={`relative 
                  w-35 aspect-[4/.9] md:w-50`}
            >
              <Image
                src={footerData.logo}
                alt="logo"
                fill
                sizes="100%"
                className="object-cover"
              />
            </div>
            <p className=" text-white/60">{footerData.description}</p>
          </div>

          {footerData.lists.map((list, index) => (
            <div className={` flex flex-col gap-4`} key={index}>
              <h2
                className="uppercase text-white/60 tracking-widest"
                dangerouslySetInnerHTML={{ __html: list.title ?? "" }}
              />
              <ul className={`flex flex-col md:gap-2 gap-4`}>
                {list.links.map((item, suIndex) => (
                  <li key={suIndex}>
                    {/* <span
                      className={`mt-1 ${
                        index === 1
                          ? "text-white flex items-center justify-center rounded-sm bg-white w-10 aspect-square"
                          : "text-white inline-block"
                      }`}
                    >
                      {item.icon}
                      <span className="sr-only">{item.label}</span>
                    </span> */}
                    {/* {item.title && (
                      <span
                        className={`${
                          index === 1
                            ? "text-white font-aboreto text-2xl my-auto"
                            : "md:text-lg text-white inline-block"
                        }`}
                      >
                        {item.title}
                      </span>
                    )} */}
                    {item.href ? (
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={item.href}
                        className=" text-sm"
                      >
                        <span className={` text-white/80 inline-block`}>
                          {item.label}
                        </span>
                      </Link>
                    ) : (
                      <span className={` text-white/80 text-sm`}>{item.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-white/10 h-px w-full" />
      </Container>
      <Container className="py-4 flex max-md:flex-col items-center gap-3.5 justify-between">
        <div className="md:flex max-md:space-x-2 text-center flex-wrap items-center justify-center gap-2 text-white text-sm">
          {" "}
          <span className="text-white">
            © {new Date().getFullYear()} Aroha Palms.
          </span>
          <span className="text-white">All Rights Reserved.</span>
          {/* <span className="md:block hidden">|</span> */}
        </div>
        <p className="text-white! max-md:text-center text-sm">
          Powered by {""}
          <Link href="https://www.fielmente.com/" target="_blank">
            Fielmente
          </Link>
        </p>
      </Container>
    </footer>
  );
};

export default LandingFooter;
