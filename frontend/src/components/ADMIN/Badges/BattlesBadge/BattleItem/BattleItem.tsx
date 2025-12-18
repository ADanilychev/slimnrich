import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

import Button from '@/components/UI/Button/Button';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { IBaseBattle } from '@/lib/types/Battle.type';
import { IAdminInfoBattle } from '@/lib/types/services/battles.type';

import { useRouter } from '@/i18n/routing';

import './battleItem.scss';

interface IBattleItem {
    baseBattle: IBaseBattle;
    entity?: IAdminInfoBattle;
}

export function BattleItem({ baseBattle, entity }: IBattleItem) {
    const tBattleConfig = useTranslations('BattleConfig.' + baseBattle.type);

    const router = useRouter();
    return (
        <div className="admin-battle-item">
            <div className="admin-battle-item__left">
                <h3>
                    ID: {entity?.id} - {tBattleConfig('Title')}
                </h3>
                <div>
                    <small className="admin-battle-item__status ">
                        {entity?.status} ({entity && format(entity.end_timestamp * 1000, 'dd.MM.yyyy')})
                    </small>
                    <small className="admin-battle-item__users">
                        <b>{entity?.participants.length}</b> users
                    </small>
                </div>
            </div>
            <div className="admin-battle-item__right">
                <Button
                    variant={'stroke'}
                    onClick={() => router.push(ADMIN_PAGE.BATTLE_STATISTIC(baseBattle.type, entity?.id || 0))}
                >
                    View
                </Button>
            </div>
        </div>
    );
}
