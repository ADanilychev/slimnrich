import { NextPage } from 'next';

import StepByStepTest from './StepByStepTest';

interface Props {}

const Page: NextPage<Props> = async ({}) => {
    return <StepByStepTest />;
};

export default Page;
