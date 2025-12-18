import { useQuery } from '@tanstack/react-query';

import { RegisterService } from '@/services/register.service';

export const useGetQuestions = () => {
    const query = useQuery({
        queryKey: ['get-questions'],
        queryFn: async () => await RegisterService.getQuestions(),
    });

    return { ...query };
};
