export default function MonogramMark({ className = "", label = "Nagoor monogram" }) {
    return (
        <div className={`monogram-mark ${className}`.trim()} role="img" aria-label={label}>
            <svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">
                <defs>
                    <linearGradient id="monogramGradient" x1="10%" y1="10%" x2="90%" y2="90%">
                        <stop offset="0%" stopColor="#6d28d9" />
                        <stop offset="45%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
                <rect x="10" y="10" width="100" height="100" rx="24" fill="url(#monogramGradient)" />
                <path
                    d="M34 28v64l20-28 20 28V28h-12v42l-8-12-8 12V28H34z"
                    fill="#050816"
                    stroke="#f8fbff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
