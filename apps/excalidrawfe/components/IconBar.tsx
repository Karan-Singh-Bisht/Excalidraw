import { ReactNode } from "react";

export function IconBar({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
}) {
  return (
    <div
      className={`${activated ? "text-red-400" : "text-white"} hover:cursor-pointer rounded-full border p-2 bg-black hover:bg-gray`}
      onClick={onClick}
    >
      {icon}
    </div>
  );
}
