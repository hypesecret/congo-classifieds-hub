import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const PageWrapper = ({ children, hideFooter }: PageWrapperProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">{children}</main>
    {!hideFooter && <Footer />}
  </div>
);

export default PageWrapper;
