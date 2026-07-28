"use client";

import { useWebContext } from "@/context-api/WebContext";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import SwiperCarousel from "../sliders/SwiperCarousel";
import { Autoplay, Navigation } from "swiper/modules";

const RoomDetailsPopup = () => {
  const { room, isOpen, closeRoom } = useWebContext();
  return (
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-xs px-4 flex items-center justify-center z-50 transform duration-300 ease-in-out transition-all ${isOpen ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-3d"}`}
    >
      <div className="bg-background-2  relative max-w-3xl w-full lg:p-8 p-4 rounded-2xl">
        <button
          className="absolute top-4 right-4 max-lg:top-2 max-lg:right-2 text-2xl text-primary"
          onClick={closeRoom}
        >
          <MdClose />
        </button>
        <div className="grid max-lg:mt-3.5 lg:grid-cols-2 grid-cols-1 gap-6 ">
          <div className="lg:block hidden w-full room-card">
            <SwiperCarousel
              data={room?.images || []}
              slidesPerView={1}
              spaceBetween={0}
              loop
              speed={1000}
              modules={[Autoplay, Navigation]}
              navigation={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false,
              }}
              swiperSlideClassName="aspect-4/4 relative rounded-2xl overflow-hidden"
              renderSlide={(image) => (
                <Image
                  src={image}
                  alt={room?.title || ""}
                  fill
                  sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            />
          </div>
          <div className="space-y-4 h-[70dvh] lg:h-[46.5dvh] lg:pr-4 hide-scroll overflow-y-auto">
            <h2 className="font-primary lg:text-3xl text-2xl text-p2">
              {room?.title}
            </h2>
            <div className="lg:hidden w-full">
              <SwiperCarousel
                data={room?.images || []}
                slidesPerView={1}
                spaceBetween={0}
                loop
                speed={1000}
                modules={[Autoplay, Navigation]}
                navigation={true}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  waitForTransition: false,
                }}
                swiperSlideClassName="aspect-4/4 relative rounded-xl overflow-hidden"
                renderSlide={(image) => (
                  <Image
                    src={image}
                    alt={room?.title || ""}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
              />
            </div>
            {room?.moreInfo.description.map((item, index) => (
              <p className="text-sm text-secondary" key={index}>
                {item}
              </p>
            ))}
            {room?.moreInfo.listOfData.title && (
              <p className="font-semibold text-p2">
                {room?.moreInfo.listOfData.title}
              </p>
            )}
            {room?.moreInfo.listOfData.list.map((item, index) => (
              <p className="text-sm text-secondary" key={index}>
                {item}
              </p>
            ))}
            {room?.moreInfo.review.author && (
              <div className="space-y-2">
                <p className="text-sm text-p2">Guest Review</p>
                <p className="">{room?.moreInfo.review.author}</p>
                <div className="w-full h-px bg-white/10" />
                <p className="text-sm text-secondary">
                  {room?.moreInfo.review.description}
                </p>
              </div>
            )}
            {/* note */}
            {room?.note.title && (
              <div className="space-y-2">
                <p className="font-semibold text-p2">{room?.note.title}</p>
                {room?.note.notes.map((item, index) => (
                  <p className="text-sm text-secondary" key={index}>
                    {index + 1}. {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPopup;
