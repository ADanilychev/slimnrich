import { User } from './User';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const { id } = params;

    return <User userId={id} />;
}
