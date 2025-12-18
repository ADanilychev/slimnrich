import PostGiftPage from './PostGiftPage';

const Page = async (props: { params: Promise<{ file_id: string }> }) => {
    const params = await props.params;

    const { file_id } = params;

    return <PostGiftPage file_id={file_id} />;
};

export default Page;
