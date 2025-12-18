'use client';

import React from 'react';

import './moveTabMenu.scss';

interface IMoveTabMenu {
    tabs: Record<string, string>[];
    activeTab?: string;
    changeHandler: (tab: string) => void;
}

const MoveTabMenu = ({ tabs, activeTab, changeHandler }: IMoveTabMenu) => {
    const [active, _] = React.useState(activeTab || tabs[0]);

    return (
        <div className="move-tab-menu">
            <div className="move-tab-menu__wrapper">
                {tabs.map((name, index) => (
                    <React.Fragment key={index}>
                        <input
                            type="radio"
                            id={`radio-${index}`}
                            name="tabs"
                            defaultChecked={active === Object.keys(name)[0]}
                            onChange={(event) => changeHandler(Object.keys(name)[0])}
                        />
                        <label className="move-tab-menu__item" htmlFor={`radio-${index}`}>
                            {Object.values(name)[0]}
                        </label>
                    </React.Fragment>
                ))}
                <div className="glider" style={{ width: `calc(100% / ${tabs.length} )` }}></div>
            </div>
        </div>
    );
};

export default MoveTabMenu;
