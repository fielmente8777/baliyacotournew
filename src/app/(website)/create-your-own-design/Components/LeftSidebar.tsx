import { EmbroideryIcon, FabricIcon } from "@/utils/icon";
import {
  Scissors
} from "lucide-react";

interface Props {
  active: string;
}

const menus = [
  {
    id: "fabric",
    label: "Fabric",
    icon: FabricIcon,
  },
  {
    id: "embroidery",
    label: "Embroidery",
    icon: EmbroideryIcon,
  },
  {
    id: "option",
    label: "Option",
    icon: Scissors,
  },
];

export default function LeftSidebar({
  active,
}: Props) {
  return (
    <aside
      className="
      sticky
      top-24
      h-fit
      rounded-full
      bg-white
      p-5
      shadow
    "
    >
      <h3 className="mb-6 text-center text-sm font-semibold">
        Styling
      </h3>

      <div className="space-y-5">

        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className="flex w-full flex-col items-center gap-2"
            >
              <div
                className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border

                ${
                  active === item.id
                    ? "border-[#972E47] bg-[#FFF4F7]"
                    : "border-[#ECECEC]"
                }
              `}
              >
                <Icon size={22} />
              </div>

              <span className="text-xs">
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
    </aside>
  );
}