import PageContainer from '@/app/components/container/PageContainer';
import Customizer from '@/app/components/shared/Customizer';

export default function CustomizerPage() {
  return (
    <PageContainer title="CustomizerPage" description="This is the customizer page">
      <Customizer />
    </PageContainer>
  );
}

export const metadata = { title: 'CustomizerPage' };
