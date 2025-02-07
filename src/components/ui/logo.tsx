const Logo: React.FC<{ width?: number; height?: number }> = ({
  width = 24,
  height = 24,
}) => {
  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base circle */}
        <circle cx="50" cy="50" r="50" fill="#FFFDE5" />

        {/* Top-right quarter-circle */}
        <path d="M 50,0 A 50 50 0 0 1 100,50 L 50,50 Z" fill="#00afb6" />

        {/* Bottom-right quarter-circle */}
        <path d="M 100,50 A 50 50 0 0 1 50,100 L 50,50 Z" fill="#002c62" />

        {/* Bottom-left quarter-circle */}
        <path d="M 50,100 A 50 50 0 0 1 0,50 L 50,50 Z" fill="#e70020" />

        {/* Horizontal line */}
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="#FFFDE5"
          stroke-width="4"
        />

        {/* Vertical line */}
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="100"
          stroke="#FFFDE5"
          stroke-width="4"
        />

        {/* Center circle */}
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="#00213F"
          stroke="#FFFDE5"
          stroke-width="4"
        />
      </svg>
    </>
  );
};

export default Logo;
