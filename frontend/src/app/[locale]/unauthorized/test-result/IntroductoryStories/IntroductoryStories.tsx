import { useTranslations } from 'next-intl';
import { FC } from 'react';
import Stories from 'react-insta-stories';

import StoryItem from '@/components/StoryItem/StoryItem';

import {
    progressContainerStyles,
    progressStyles,
    progressWrapperStyles,
    storyContainerStyles,
} from '@/lib/configs/Story.config';

import Story1 from '../../../../../..//public/img/introductory-stories/slide-1.svg';
import Story2 from '../../../../../../public/img/introductory-stories/slide-2.svg';
import Story3 from '../../../../../../public/img/introductory-stories/slide-3.svg';
import Story4 from '../../../../../../public/img/introductory-stories/slide-4.svg';
import Story5 from '../../../../../../public/img/introductory-stories/slide-5.svg';
import Story6 from '../../../../../../public/img/introductory-stories/slide-6.svg';
import Crown from '../Crown/Crown';

interface IIntroductoryStories {
    onAllStoriesEnd: () => void;
}

const IntroductoryStories: FC<IIntroductoryStories> = ({ onAllStoriesEnd }) => {
    const t = useTranslations('IntroductoryStories');
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
                                    <div className="story-item__header">
                                        <span className="story-item__day">
                                            <p>{t('First.Title')}</p>
                                        </span>
                                    </div>

                                    <p className="story-item__text">{t('First.Description')}</p>
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
                                <div className="story-item__header">
                                    <span className="story-item__day">
                                        <p>{t('Second.Title')}</p>
                                    </span>

                                    <div className="story-item__day story-item__free">FREE</div>
                                </div>

                                <p className="story-item__text">{t('Second.Description')}</p>
                            </div>

                            <Story2 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-3.svg'} imgAlt={'story-3'}>
                            <div className="story-item__content">
                                <div className="story-item__header">
                                    <span className="story-item__day">
                                        <p>{t('Third.Title')}</p>
                                    </span>

                                    <Crown />
                                </div>

                                <p className="story-item__text">{t('Third.Description')}</p>
                            </div>

                            <Story3 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-4.svg'} imgAlt={'story-4'}>
                            <div className="story-item__content">
                                <div className="story-item__header">
                                    <span className="story-item__day">
                                        <p>{t('Fourth.Title')}</p>
                                    </span>
                                    <Crown />
                                </div>

                                <p className="story-item__text">{t('Fourth.Description')}</p>
                            </div>
                            <Story4 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-5.svg'} imgAlt={'story-5'}>
                            <div className="story-item__content">
                                <div className="story-item__header">
                                    <span className="story-item__day">
                                        <p>{t('Fifth.Title')}</p>
                                    </span>

                                    <Crown />
                                </div>

                                <p className="story-item__text">{t('Fifth.Description')}</p>
                            </div>
                            <Story5 />
                        </StoryItem>
                    ),
                },
                {
                    content: () => (
                        <StoryItem imgSrc={'/img/welcome-stories/story-6.svg'} imgAlt={'story-6'}>
                            <div className="story-item__content">
                                <div className="story-item__header">
                                    <span className="story-item__day">
                                        <p>{t('Sixth.Title')}</p>
                                    </span>
                                    <Crown />
                                </div>

                                <p className="story-item__text">{t('Sixth.Description')}</p>
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

export default IntroductoryStories;
