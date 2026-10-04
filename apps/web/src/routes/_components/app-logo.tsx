import type { FC, ReactElement, SVGProps } from "react";

export const AppLogo: FC<SVGProps<SVGSVGElement>> = (props): ReactElement => {
	const { className = "size-6", ...rest } = props;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			fill="none"
			className={className}
			aria-label="HRIS Management Logo"
			{...rest}
		>
			<defs>
				<linearGradient
					id="hris-bg-logo"
					x1="0"
					y1="0"
					x2="64"
					y2="64"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#0b1329" />
					<stop offset="50%" stopColor="#0f172a" />
					<stop offset="100%" stopColor="#020617" />
				</linearGradient>

				<linearGradient
					id="hris-border-logo"
					x1="0"
					y1="0"
					x2="64"
					y2="64"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
					<stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
					<stop offset="100%" stopColor="#1e293b" stopOpacity="0.7" />
				</linearGradient>

				<linearGradient
					id="left-grad-logo"
					x1="21"
					y1="11"
					x2="21"
					y2="50"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#38bdf8" />
					<stop offset="40%" stopColor="#0ea5e9" />
					<stop offset="100%" stopColor="#2563eb" />
				</linearGradient>

				<linearGradient
					id="right-grad-logo"
					x1="43"
					y1="11"
					x2="43"
					y2="50"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#a78bfa" />
					<stop offset="40%" stopColor="#818cf8" />
					<stop offset="100%" stopColor="#6366f1" />
				</linearGradient>

				<linearGradient
					id="bridge-grad-logo"
					x1="20"
					y1="36"
					x2="44"
					y2="36"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#0ea5e9" />
					<stop offset="50%" stopColor="#3b82f6" />
					<stop offset="100%" stopColor="#818cf8" />
				</linearGradient>

				<linearGradient
					id="spark-grad-logo"
					x1="32"
					y1="10"
					x2="32"
					y2="22"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#ffffff" />
					<stop offset="40%" stopColor="#a5f3fc" />
					<stop offset="100%" stopColor="#38bdf8" />
				</linearGradient>

				<radialGradient
					id="core-glow-logo"
					cx="32"
					cy="32"
					r="24"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
					<stop offset="60%" stopColor="#6366f1" stopOpacity="0.12" />
					<stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
				</radialGradient>
			</defs>

			<rect width="64" height="64" rx="16" fill="url(#hris-bg-logo)" />
			<rect
				x="0.75"
				y="0.75"
				width="62.5"
				height="62.5"
				rx="15.25"
				stroke="url(#hris-border-logo)"
				strokeWidth="1.5"
			/>
			<circle cx="32" cy="32" r="22" fill="url(#core-glow-logo)" />
			<rect
				x="20"
				y="32"
				width="24"
				height="8"
				rx="4"
				fill="url(#bridge-grad-logo)"
			/>
			<circle cx="21" cy="16" r="5" fill="url(#left-grad-logo)" />
			<rect
				x="16"
				y="24"
				width="10"
				height="26"
				rx="5"
				fill="url(#left-grad-logo)"
			/>
			<circle cx="43" cy="16" r="5" fill="url(#right-grad-logo)" />
			<rect
				x="38"
				y="24"
				width="10"
				height="26"
				rx="5"
				fill="url(#right-grad-logo)"
			/>
			<path
				d="M32 10 Q32 16 37 16 Q32 16 32 22 Q32 16 27 16 Q32 16 32 10 Z"
				fill="url(#spark-grad-logo)"
			/>
		</svg>
	);
};
