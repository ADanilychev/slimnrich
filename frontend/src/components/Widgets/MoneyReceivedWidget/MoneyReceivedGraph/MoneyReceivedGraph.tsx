import Image from 'next/image';

import cn from '@/lib/import/classnames';

import './moneyReceivedGraph.scss';

export function MoneyReceivedGraph({ payload }: { payload: (number | null)[] }) {
    return (
        <div className="money-received-graph">
            <div className="money-received-graph__wrapper">
                {payload.map((item, index) => (
                    <div className="money-received-graph__item" key={index}>
                        <div
                            className={cn('money-received-graph__block', {
                                'money-received-graph__block_checked': item && item >= 0,
                                'money-received-graph__block_unchecked': item && item < 0,
                            })}
                        >
                            <Image
                                src={`/img/money-received/${item && item >= 0 ? 'checked.svg' : 'unchecked.svg'}`}
                                width={10}
                                height={10}
                                alt="status"
                            />
                            <p>{item}</p>
                        </div>
                        <p className="money-received-graph__text">{index + 1} wk.</p>
                        {/* <small>21-27</small> */}
                    </div>
                ))}
            </div>
        </div>
    );
}
