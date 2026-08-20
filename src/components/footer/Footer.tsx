import Link from "next/link";
import { Container } from "../sectionComponants";
import { websiteFooterData } from "./footerData";
import Image from "next/image";
import clsx from "clsx";

const Footer = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="flex flex-col gap-16 py-10">
        {/* line */}
        <Line />
        <Container className="grid md:grid-cols-3 grid-cols-1 max-xl:gap-6">
          <div className="w-[200px] text-center">
            <div className="relative w-[200px] aspect-4/1.5">
              <Image
                src={websiteFooterData.logo}
                alt="logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4">{websiteFooterData.description}</p>
          </div>
          {websiteFooterData.lists.map((list, index) => (
            <div
              key={index}
              className={clsx(
                "flex flex-col gap-4",
                index === 1 && "w-fit xl:ml-auto",
                index === 0 && "w-fit xl:ml-40"
              )}
            >
              <h3 className="text-2xl font-bold">{list.title}</h3>
              <ul className="flex flex-col gap-2">
                {list.links.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
        <Line />
      </div>
      <div className="bg-secondary">
        <Container className="py-4">
          <div className="flex max-md:flex-col items-center justify-between gap-2 text-white ">
            {" "}
            <p className="">© Baliye Couture. All rights reserved.</p>
            <p className="">Powered by Fielmente</p>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;

export const Line = () => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
      <div className="h-px bg-white"></div>
      <span>
        <Foo />
      </span>
      <div className="h-px bg-white"></div>
    </div>
  );
};

export const Foo = () => (
  <svg
    width={33}
    height={32}
    viewBox="0 0 33 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.4408 13.538C13.2031 11.4495 10.9653 9.36091 8.72754 7.27233C8.72754 5.10916 8.72754 2.90866 8.72754 0.670898C10.5178 2.01356 12.3079 3.35626 14.0982 4.69892C14.5457 7.6826 14.9933 10.6289 15.4408 13.538Z"
      fill="#F9C365"
    />
    <path
      d="M17.4541 13.5384C19.4681 11.2261 21.4448 8.91372 23.3842 6.60136C23.1604 4.43819 22.9366 2.23776 22.7129 0C21.0718 1.56643 19.4308 3.09555 17.7898 4.58739C17.7152 7.57107 17.6033 10.5548 17.4541 13.5384Z"
      fill="#F9C365"
    />
    <path
      d="M16.336 17.5654C17.2311 20.4745 18.1262 23.3836 19.0213 26.2927C18.0516 28.1575 17.0446 30.0596 16.0003 31.999C15.0306 29.985 14.0982 27.9337 13.2031 25.8451C14.2474 23.0852 15.2917 20.3253 16.336 17.5654Z"
      fill="#F9C365"
    />
    <path
      d="M14.4337 17.0059C12.718 19.542 11.0024 22.0781 9.28682 24.6142C7.19824 24.9872 5.07235 25.3602 2.90918 25.7331C3.95347 23.7191 4.96048 21.7425 5.93017 19.8031C8.76468 18.8334 11.5991 17.901 14.4337 17.0059Z"
      fill="#F9C365"
    />
    <path
      d="M14.0979 15.2169C11.1142 15.5153 8.09325 15.851 5.03497 16.2239C3.39394 14.8067 1.71562 13.4267 0 12.084C2.16317 11.5619 4.32633 11.0397 6.4895 10.5176C9.02563 12.084 11.5618 13.6505 14.0979 15.2169Z"
      fill="#F9C365"
    />
    <path
      d="M18.2373 17.0059C21.221 17.6772 24.2047 18.3485 27.1884 19.0198C28.3072 20.8846 29.4261 22.7494 30.545 24.6142C28.3072 24.3905 26.0695 24.1666 23.8317 23.9429C21.9669 21.6305 20.1021 19.3182 18.2373 17.0059Z"
      fill="#F9C365"
    />
    <path
      d="M18.5732 15.1054C21.0348 13.3152 23.5336 11.5623 26.0698 9.84668C28.2329 10.2942 30.3588 10.7045 32.4474 11.0774C30.8064 12.5693 29.1281 14.0611 27.4124 15.553C24.4288 15.4038 21.4823 15.2546 18.5732 15.1054Z"
      fill="#F9C365"
    />
    <path
      d="M17.7904 15.4403C17.7904 16.2235 17.231 16.8949 16.4478 16.8949C15.6645 16.8949 14.9932 16.2235 14.9932 15.4403C14.9932 14.6571 15.6645 14.0977 16.4478 14.0977C17.231 14.0977 17.7904 14.6571 17.7904 15.4403Z"
      fill="#F9C365"
    />
  </svg>
);
