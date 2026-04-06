import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  variant?: 'dark' | 'light';
}

const sizes = {
  sm: { icon: 24, text: 'text-16' },
  md: { icon: 32, text: 'text-20' },
  lg: { icon: 48, text: 'text-28' },
};

const Logo = ({ size = 'md', linkTo, variant = 'dark' }: LogoProps) => {
  const s = sizes[size];
  const nameColor = variant === 'light' ? 'text-primary-foreground' : 'text-foreground';

  const content = (
    <span className="flex items-center gap-2">
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="hsl(145, 100%, 30%)" />
        <path d="M24 10C19.58 10 16 13.58 16 18C16 24.5 24 34 24 34C24 34 32 24.5 32 18C32 13.58 28.42 10 24 10ZM24 21.5C22.07 21.5 20.5 19.93 20.5 18C20.5 16.07 22.07 14.5 24 14.5C25.93 14.5 27.5 16.07 27.5 18C27.5 19.93 25.93 21.5 24 21.5Z" fill="white" />
        <path d="M12 36C12 36 16 33 24 33C32 33 36 36 36 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </svg>
      <span className={`font-heading font-bold ${s.text} leading-none`}>
        <span className={nameColor}>Expat</span>
        <span className="text-primary">-Congo</span>
      </span>
    </span>
  );

  if (linkTo) {
    return <Link to={linkTo} className="flex items-center">{content}</Link>;
  }

  return content;
};

export default Logo;
