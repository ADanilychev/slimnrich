import { useTranslations } from 'next-intl';
import React from 'react';
import Stories from 'react-insta-stories';

import StoryItem from '@/components/StoryItem/StoryItem';

import {
    progressContainerStyles,
    progressStyles,
    progressWrapperStyles,
    storyContainerStyles,
} from '@/lib/configs/Story.config';

import Story1 from '../../../../../../public/img/welcome-stories/story-1.svg';
import Story2 from '../../../../../../public/img/welcome-stories/story-2.svg';
import Story3 from '../../../../../../public/img/welcome-stories/story-3.svg';
import Story4 from '../../../../../../public/img/welcome-stories/story-4.svg';
import Story5 from '../../../../../../public/img/welcome-stories/story-5.svg';
import Story6 from '../../../../../../public/img/welcome-stories/story-6.svg';

interface IInstaStories {
    onAllStoriesEnd: () => void;
}

const InstaStories: React.FC<IInstaStories> = ({ onAllStoriesEnd }) => {
    const t = useTranslations('WelcomePage');

    return (
        <Stories
            loop
            storyContainerStyles={storyContainerStyles}
            progressContainerStyles={progressContainerStyles}
            progressWrapperStyles={progressWrapperStyles}
            progressStyles={progressStyles}
            width={'100%'}
            height={'100%'}
            preloadCount={2}
            onAllStoriesEnd={onAllStoriesEnd}
            stories={[
                {
                    content: () => {
                        return (
                            <StoryItem imgSrc={'/img/welcome-stories/story-1.svg'} imgAlt={'story-1'}>
                                <div className="story-item__content">
                                    <span className="story-item__day">
                                        <p>{t('story1.value')}</p>
                                    </span>
                                </div>
                                <Story1 />
                            </StoryItem>
                        );
                    },
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-2.svg'} imgAlt={'story-2'}>
                            <div className="story-item__content">
                                <span className="story-item__day">
                                    <p>{t('story2.value')}</p>
                                </span>

                                <p className="story-item__text">{t('story2.text')}</p>
                            </div>

                            <Story2 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-3.svg'} imgAlt={'story-3'}>
                            <div className="story-item__content">
                                <span className="story-item__day">
                                    <p>{t('story3.value')}</p>
                                </span>

                                <p className="story-item__text">{t('story3.text')}</p>
                            </div>

                            <Story3 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-4.svg'} imgAlt={'story-4'}>
                            <div className="story-item__content">
                                <p className="story-item__text">{t('story4.text')}</p>
                            </div>

                            <Story4 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-5.svg'} imgAlt={'story-5'}>
                            <div className="story-item__content">
                                <p className="story-item__text">
                                    {t.rich('story5.text', {
                                        span: (chunks) => <span>{chunks}</span>,
                                    })}
                                </p>
                            </div>

                            <Story5 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-6.svg'} imgAlt={'story-6'}>
                            <div className="story-item__content">
                                <span className="story-item__day">
                                    <p>{t('story6.value')}</p>
                                </span>

                                <p className="story-item__text">{t('story6.text')}</p>
                            </div>

                            <Story6 />
                        </StoryItem>
                    ),
                },
            ]}
            defaultInterval={3000}
        />
    );
};

export default InstaStories;
