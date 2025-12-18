import { UserPage } from './UserPage';

const Page = async (props: { params: Promise<{ id: string }> }) => {
    const params = await props.params;

    const { id } = params;
    return <UserPage userId={id} />;
};

export default Page;
