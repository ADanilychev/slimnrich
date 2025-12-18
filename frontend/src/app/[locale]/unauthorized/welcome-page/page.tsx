import { NextPage } from 'next';

import WelcomePage from './WelcomePage';

interface Props {
    searchParams: Promise<{
        showWelcomeStories: string | undefined;
    }>;
}

const Page: NextPage<Props> = async (props) => {
    const searchParams = await props.searchParams;

    const { showWelcomeStories } = searchParams;

    return <WelcomePage showWelcomeStoriesParam={showWelcomeStories === undefined || showWelcomeStories === 'true'} />;
};

export default Page;
