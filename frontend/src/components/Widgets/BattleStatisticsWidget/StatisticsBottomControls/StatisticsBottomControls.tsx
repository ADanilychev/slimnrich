import Button from '@/components/UI/Button/Button';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';

import { useRouter } from '@/i18n/routing';

export function StatisticsBottomControls({
    battle_config,
    bidCount,
}: {
    bidCount: number;
    battle_config: (typeof BattleConfig)[BattleType.BY_MYSELF];
}) {
    const router = useRouter();

    return (
        <div className="battle-widget__controls">
            {battle_config.actionBattleButtons ? (
                <>
                    <Button variant={'orange'}>Create a new battle</Button>
                    <Button variant={'green'}>Join in battle</Button>
                </>
            ) : (
                // stroke
                <Button
                    variant={'orange'}
                    onClick={() => router.push(battle_config.accept_link ? battle_config.accept_link(bidCount) : '#')}
                >
                    Accept
                </Button>
            )}
        </div>
    );
}
