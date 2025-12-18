import { SupportChat } from './SupportChat';

export default async function Page(props: { params: Promise<{ chatId: string }> }) {
    const params = await props.params;

    const { chatId } = params;
    return <SupportChat chatId={chatId} />;
}
