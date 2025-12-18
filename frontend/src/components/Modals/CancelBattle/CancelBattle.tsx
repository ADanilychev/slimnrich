'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useTransition } from 'react';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { BattleType } from '@/lib/configs/Battle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';

import { useRouter } from '@/i18n/routing';
import { BattleService } from '@/services/battle.service';

import './cancelBattle.scss';

export function CancelBattle({ battle_type }: { battle_type: BattleType }) {
    const t = useTranslations('Modals.CancelBattle');

    const router = useRouter();
    const queryClient = useQueryClient();
    const { togglePopup } = useModal();

    const [isPending, startTransition] = useTransition();

    const { mutateAsync: deleteVsFriendMutate, isPending: isPendingMutate } = useMutation({
        mutationKey: ['delete-vsfrined-battle'],
        mutationFn: async (_: {}) => await BattleService.deleteVsFriend(),
    });

    const { mutateAsync: deleteWithYourGroupMutate, isPending: isPendingWithYourGroupMutate } = useMutation({
        mutationKey: ['delete-withgroup-battle'],
        mutationFn: async (_: {}) => await BattleService.deleteWithYourGroup(),
    });

    const deleteBattleHandler = async () => {
        if (battle_type === BattleType.ONE_ON_ONE_WITH_FRIENDS) {
            await deleteVsFriendMutate(
                {},
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['fetch-user-battles'] });
                        startTransition(() => {
                            router.push(ROUTES.BATTLE);
                        });
                    },
                    onError: async (error) => await ApiErrorHandler(error, "Couldn't cancel the battle"),
                },
            );
        }

        if (battle_type === BattleType.WITH_YOUR_GROUP) {
            await deleteWithYourGroupMutate(
                {},
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['fetch-user-battles'] });
                        startTransition(() => {
                            router.push(ROUTES.BATTLE);
                        });
                    },
                    onError: async (error) => await ApiErrorHandler(error, "Couldn't cancel the battle"),
                },
            );
        }
        togglePopup(false);
    };

    return (
        <div className="modal-dialog cancel-battle-modal">
            <div className="cancel-battle-modal__top">
                <Image src={'/img/ok-error.svg'} width={33} height={33} alt="error" />
                <h3>{t('Title')}</h3>
            </div>

            <div className="cancel-battle-modal__buttons">
                <Button variant="active" onClick={() => togglePopup(false)}>
                    {t('No')}
                </Button>
                <Button
                    variant="stroke"
                    isLoading={isPendingMutate || isPending || isPendingWithYourGroupMutate}
                    onClick={deleteBattleHandler}
                >
                    {t('Yes')}
                </Button>
            </div>
        </div>
    );
}
