interface OnlyButtonProps {
  label: string;
  className?: string;
  onclick?: () => void;
}
const OnlyButton: React.FC<OnlyButtonProps> = ({
  label,
  className = "",
  onclick,
  ...props
}) => {
  return (
    <button
      className={`flex uppercase items-center gap-2 border w-fit px-4 py-2 rounded-lg font-semibold hover:scale-95 transition-all duration-300 ease-in-out hover:shadow-lg ${className}`}
      {...props}
      onClick={onclick}
    >
      {label}
    </button>
  );
};

export default OnlyButton;
