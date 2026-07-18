/** 솔로그 로고 마크: 아침 해 위로 돋아나는 새싹 (favicon.svg와 동일 아트) */
function Logo({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="솔로그 로고"
    >
      <circle cx="32" cy="32" r="30" fill="#FDFBF7" />
      <circle cx="32" cy="25" r="14" fill="#F6C46B" opacity="0.28" />
      <circle cx="32" cy="25" r="9" fill="#F6C46B" />
      <g
        stroke="#F6C46B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      >
        <path d="M32 9.5 V14" />
        <path d="M19.5 14.5 l3.2 3.2" />
        <path d="M44.5 14.5 l-3.2 3.2" />
      </g>
      <path d="M6.6 48 Q32 39 57.4 48 A30 30 0 0 1 6.6 48 Z" fill="#E6F4EA" />
      <path
        d="M32 52 C32 47 32 43 32 38"
        stroke="#2F6B45"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 38 C24.5 38.5 19.8 33 19 26.5 C26.5 27 31.2 31.5 32 38 Z"
        fill="#3D8B5A"
      />
      <path
        d="M32 38 C39.5 38.5 44.2 33 45 26.5 C37.5 27 32.8 31.5 32 38 Z"
        fill="#57A374"
      />
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#E8E2D9"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export default Logo
