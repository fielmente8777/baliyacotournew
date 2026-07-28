interface ContainerProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

const Container: React.FC<ContainerProps> = ({
  className = "",
  children,
  id = "",
  style = {},
  ...props
}) => {
  return (
    <div className={`max_width ${className}`} id={id} style={style} {...props}>
      {children}
    </div>
  );
};

export default Container;
