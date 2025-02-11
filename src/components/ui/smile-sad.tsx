const SmileSad: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="16"
      height="16"
    >
      <circle cx="50" cy="50" r="40" fill="yellow" />
      <circle cx="35" cy="40" r="5" fill="black" />
      <circle cx="65" cy="40" r="5" fill="black" />
      <path
        d="M30 65 Q50 45 70 65"
        stroke="black"
        strokeWidth="5"
        fill="transparent"
      />
    </svg>
  );
};

export default SmileSad;
