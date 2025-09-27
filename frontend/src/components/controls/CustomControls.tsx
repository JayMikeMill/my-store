import { XIcon } from "lucide-react";

interface ClassName {
  className?: string;
}

interface ButtonProps extends ClassName {
  onClick:
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | (() => void);
}

export const XButton: React.FC<ButtonProps> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      className={`btn-circle-x ${className}`}
      onClick={onClick}
    >
      <XIcon />
    </button>
  );
};

export const NavButton = (isActive: boolean) => {
  return isActive ? "btn-normal-active" : "btn-normal";
};
