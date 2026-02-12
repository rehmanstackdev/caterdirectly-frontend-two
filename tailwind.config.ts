
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
			extend: {
				fontFamily: {
					'inter': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
					'manrope': ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
					'poppins': ['Poppins', 'sans-serif'],
				},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))'
        },
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				glass: {
					bg: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))',
					shadow: 'hsl(var(--glass-shadow))'
				},
				finance: {
					revenue: 'hsl(var(--finance-revenue))',
					expense: 'hsl(var(--finance-expense))',
					pipeline: 'hsl(var(--finance-pipeline))',
					neutral: 'hsl(var(--finance-neutral))',
					positive: 'hsl(var(--finance-positive))',
					negative: 'hsl(var(--finance-negative))',
					warning: 'hsl(var(--finance-warning))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'tab-float': {
					'0%': { transform: 'translateY(0)' },
					'25%': { transform: 'translateY(-2.5px)' },
					'50%': { transform: 'translateY(-5px)' },
					'75%': { transform: 'translateY(-2.5px)' },
					'100%': { transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'tab-float': 'tab-float 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
			},
			backdropBlur: {
				'glass': '12px',
				'glass-heavy': '20px'
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
				'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
				'glass-hover': '0 16px 56px 0 rgba(31, 38, 135, 0.15)'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			addUtilities({
				'.scrollbar-hide': {
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
				'.scrollbar-thin': {
					'scrollbar-width': 'thin',
					'&::-webkit-scrollbar': {
						width: '6px',
						height: '6px',
					},
				},
				'.scrollbar-thumb-gray-300': {
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: 'rgba(229, 231, 235, 0.4)',
						borderRadius: '10px',
						border: '2px solid transparent',
						backgroundClip: 'padding-box',
						transition: 'background-color 0.2s ease',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						backgroundColor: 'rgba(209, 213, 219, 0.6)',
					},
				},
				'.scrollbar-thumb-gray-400': {
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: 'rgba(209, 213, 219, 0.6)',
						borderRadius: '10px',
					},
				},
				'.scrollbar-track-transparent': {
					'&::-webkit-scrollbar-track': {
						backgroundColor: 'rgba(249, 250, 251, 0.5)',
						margin: '4px 0',
						borderRadius: '10px',
					},
				},
				'.hover\\:scrollbar-thumb-gray-400:hover': {
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: 'rgba(209, 213, 219, 0.6)',
					},
				},
			});
		},
	],
} satisfies Config;
