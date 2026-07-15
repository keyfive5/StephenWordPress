import PageContainer from '@/app/components/container/PageContainer';
import Orders from '@/app/components/shared/Orders';

export default function OrderPage() {
  return (
    <PageContainer title="Orders" description="This is the orders page">
      <Orders />
    </PageContainer>
  );
}

export const metadata = { title: 'Orders' };
