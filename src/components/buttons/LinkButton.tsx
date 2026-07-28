"use client";

import { useWebContext } from "@/context-api/WebContext";
import Link from "next/link";
interface LinkButtonProps {
  href: string;
  label: string;
  className?: string;
  labelClass?: string;
  whatsAppIcon?: boolean;
  callIcon?: boolean;
  calendarIcon?: boolean;
  arrowIcon?: boolean;
  getDirectionIcon?: boolean;
  [key: string]: unknown;
  showSecureBadge?: boolean;
  secureBadgeText?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  label,
  className = "",
  labelClass = "",
  arrowIcon = false,
  whatsAppIcon = false,
  callIcon = false,
  calendarIcon = false,
  ...props
}) => {
  const { setIsOpenFormPopUp } = useWebContext();
  const handleClick = () => {
    setIsOpenFormPopUp(true);
    console.log("first");
  };
  return (
    <>
      {href === "#form" ? (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 shadow-md border w-fit px-4 py-2 hover:scale-95 transition-all duration-300 ease-in-out hover:scale-x-105 active:scale-95 ${className}`}
          {...props}
        >
          {whatsAppIcon && <WhatsAppIcon />}
          {callIcon && <CallIcon />}
          {calendarIcon && <CalendarIcon />}
          <span className={`${labelClass}`}> {label}</span>

          {arrowIcon && (
            <span>
              <ArrowIcon />
            </span>
          )}

          {/* {getDirectionIcon && <GetDirections />}  */}
        </button>
      ) : (
        <Link
          href={href}
          className={`flex items-center tracking-widest gap-1 border w-fit px-4 py-2 hover:scale-95 transition-all duration-300 ease-in-out hover:scale-x-105 active:scale-95 ${className}`}
          {...props}
        >
          {whatsAppIcon && <WhatsAppIcon />}
          {callIcon && <CallIcon />}
          {calendarIcon && <CalendarIcon />}
          <span className={`${labelClass}`}> {label}</span>

          {arrowIcon && (
            <span>
              <ArrowIcon />
            </span>
          )}

          {/* {getDirectionIcon && <GetDirections />}  */}
        </Link>
      )}
    </>
  );
};

export default LinkButton;

export const ArrowIcon = () => (
  <svg
    width={25}
    height={8}
    viewBox="0 0 25 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.3536 4.03556C24.5488 3.8403 24.5488 3.52372 24.3536 3.32845L21.1716 0.146473C20.9763 -0.0487893 20.6597 -0.0487893 20.4645 0.146473C20.2692 0.341735 20.2692 0.658318 20.4645 0.85358L23.2929 3.68201L20.4645 6.51043C20.2692 6.7057 20.2692 7.02228 20.4645 7.21754C20.6597 7.4128 20.9763 7.4128 21.1716 7.21754L24.3536 4.03556ZM0 3.68201V4.18201H24V3.68201V3.18201H0V3.68201Z"
      fill="white"
    />
  </svg>
);

export const WhatsAppIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.001 2C17.524 2 22.001 6.477 22.001 12C22.001 17.523 17.524 22 12.001 22C10.2337 22.003 8.49757 21.5353 6.97099 20.645L2.00499 22L3.35699 17.032C2.46595 15.5049 1.99789 13.768 2.00099 12C2.00099 6.477 6.47799 2 12.001 2ZM8.59299 7.3L8.39299 7.308C8.26368 7.31691 8.13734 7.35087 8.02099 7.408C7.91257 7.46951 7.81355 7.5463 7.72699 7.636C7.60699 7.749 7.53899 7.847 7.46599 7.942C7.09611 8.4229 6.89696 9.01331 6.89999 9.62C6.90199 10.11 7.02999 10.587 7.22999 11.033C7.63899 11.935 8.31199 12.89 9.19999 13.775C9.41399 13.988 9.62399 14.202 9.84999 14.401C10.9534 15.3724 12.2683 16.073 13.69 16.447L14.258 16.534C14.443 16.544 14.628 16.53 14.814 16.521C15.1052 16.5056 15.3895 16.4268 15.647 16.29C15.7778 16.2223 15.9056 16.1489 16.03 16.07C16.03 16.07 16.0723 16.0413 16.155 15.98C16.29 15.88 16.373 15.809 16.485 15.692C16.569 15.6053 16.639 15.5047 16.695 15.39C16.773 15.227 16.851 14.916 16.883 14.657C16.907 14.459 16.9 14.351 16.897 14.284C16.893 14.177 16.804 14.066 16.707 14.019L16.125 13.758C16.125 13.758 15.255 13.379 14.723 13.137C14.6673 13.1128 14.6077 13.0989 14.547 13.096C14.4786 13.0888 14.4094 13.0965 14.3442 13.1184C14.279 13.1403 14.2192 13.176 14.169 13.223C14.164 13.221 14.097 13.278 13.374 14.154C13.3325 14.2098 13.2753 14.2519 13.2098 14.2751C13.1443 14.2982 13.0733 14.3013 13.006 14.284C12.9408 14.2666 12.877 14.2446 12.815 14.218C12.691 14.166 12.648 14.146 12.563 14.11C11.9889 13.8599 11.4574 13.5215 10.988 13.107C10.862 12.997 10.745 12.877 10.625 12.761C10.2316 12.3842 9.88874 11.958 9.60499 11.493L9.54599 11.398C9.50425 11.3338 9.47003 11.265 9.44399 11.193C9.40599 11.046 9.50499 10.928 9.50499 10.928C9.50499 10.928 9.74799 10.662 9.86099 10.518C9.97099 10.378 10.064 10.242 10.124 10.145C10.242 9.955 10.279 9.76 10.217 9.609C9.93699 8.925 9.64766 8.24467 9.34899 7.568C9.28999 7.434 9.11499 7.338 8.95599 7.319C8.90199 7.31233 8.84799 7.307 8.79399 7.303C8.65972 7.2953 8.52508 7.29664 8.39099 7.307L8.59299 7.3Z"
      fill="currentColor"
    />
  </svg>
);

export const CallIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.77198 2.43881L8.84898 2.09481C9.85698 1.77281 10.935 2.29381 11.367 3.31181L12.227 5.33981C12.602 6.22281 12.394 7.26181 11.713 7.90781L9.81998 9.70581C9.93665 10.7818 10.298 11.8408 10.904 12.8828C11.4803 13.8907 12.2524 14.773 13.175 15.4778L15.451 14.7178C16.313 14.4308 17.252 14.7618 17.781 15.5388L19.013 17.3488C19.629 18.2528 19.518 19.4988 18.755 20.2648L17.937 21.0858C17.123 21.9028 15.961 22.1998 14.885 21.8638C12.3463 21.0718 10.012 18.7208 7.88198 14.8108C5.74931 10.8941 4.99665 7.57148 5.62398 4.84281C5.88798 3.69481 6.70598 2.77981 7.77398 2.43881"
      fill="currentColor"
    />
  </svg>
);

export const CalendarIcon = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 19C2 20.7 3.3 22 5 22H19C20.7 22 22 20.7 22 19V11H2V19ZM19 4H17V3C17 2.4 16.6 2 16 2C15.4 2 15 2.4 15 3V4H9V3C9 2.4 8.6 2 8 2C7.4 2 7 2.4 7 3V4H5C3.3 4 2 5.3 2 7V9H22V7C22 5.3 20.7 4 19 4Z"
      fill="currentColor"
    />
  </svg>
);
