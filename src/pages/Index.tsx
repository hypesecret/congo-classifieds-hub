import PageWrapper from '@/components/layout/PageWrapper';
import HeroSection from '@/components/search/HeroSection';
import CategoryGrid from '@/components/search/CategoryGrid';
import SponsoredCarousel from '@/components/listing/SponsoredCarousel';
import RecentListings from '@/components/listing/RecentListings';
import TrustSection from '@/components/search/TrustSection';

const Index = () => (
  <PageWrapper>
    <HeroSection />
    <CategoryGrid />
    <SponsoredCarousel />
    <RecentListings />
    <TrustSection />
  </PageWrapper>
);

export default Index;
