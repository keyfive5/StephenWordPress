
import PageContainer from "@/app/components/container/PageContainer";
import Products from "@/app/components/shared/Products";

export default function SamplePage() {

  return (
    <PageContainer title="Categoires" description="this is Categoires">
      <Products/>
    </PageContainer>
  );
};

export const metadata = { title: "My Page" };
