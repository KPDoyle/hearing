import HearingApp from '@/components/hearing-app';
export default async function Page({ params }: { params: Promise<{section:string}> }) {
  const {section} = await params;
  return <HearingApp initialSection={section} />;
}
