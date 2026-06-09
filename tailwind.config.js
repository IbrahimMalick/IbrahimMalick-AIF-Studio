/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			shimmer: 'shimmer 4s ease-in-out infinite',
  			'holographic-glow': 'holographic-glow 3s ease-in-out infinite',
  			'aurora-border': 'aurora-border 4s ease-in-out infinite',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			'holographic': {
  				cyan: 'var(--holographic-cyan)',
  				magenta: 'var(--holographic-magenta)',
  				purple: 'var(--holographic-purple)',
  				pink: 'var(--holographic-pink)',
  				gold: 'var(--holographic-gold)',
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
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
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			md: '12px',
  			lg: '16px',
  		},
  		boxShadow: {
  			'holographic': '0 0 20px rgba(0, 217, 255, 0.3), 0 0 40px rgba(131, 56, 236, 0.2)',
  			'holographic-lg': '0 0 40px rgba(0, 217, 255, 0.4), 0 0 80px rgba(255, 0, 110, 0.2)',
  			'glow-cyan': '0 0 15px rgba(0, 217, 255, 0.5)',
  			'glow-purple': '0 0 15px rgba(131, 56, 236, 0.5)',
  			'glow-pink': '0 0 15px rgba(255, 0, 110, 0.5)',
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			shimmer: 'shimmer 4s ease-in-out infinite',
  			'holographic-glow': 'holographic-glow 3s ease-in-out infinite',
  			'aurora-border': 'aurora-border 4s ease-in-out infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}