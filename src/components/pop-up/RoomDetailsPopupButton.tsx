"use client";

import { AccommodationSectionProps } from "@/@types/landingPageTypes";
import { useWebContext } from "@/context-api/WebContext";

interface RoomDetailsPopupButtonProps {
  label: string;
  roomDetails: AccommodationSectionProps["cards"][0];
}

const RoomDetailsPopupButton = ({
  label,
  roomDetails,
}: RoomDetailsPopupButtonProps) => {
  const { openRoom } = useWebContext();

  return (
    <button
      onClick={() => openRoom(roomDetails)}
      className="text-primary underline underline-offset-4 uppercase w-fit text-sm!"
    >
      {label}
    </button>
  );
};

export default RoomDetailsPopupButton;