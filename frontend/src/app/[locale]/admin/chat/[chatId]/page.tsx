import { Chat } from './Chat';

const Page = async (props: { params: Promise<{ chatId: string }> }) => {
    const params = await props.params;

    const { chatId } = params;
    return <Chat chatId={chatId} />;
};

export default Page;
