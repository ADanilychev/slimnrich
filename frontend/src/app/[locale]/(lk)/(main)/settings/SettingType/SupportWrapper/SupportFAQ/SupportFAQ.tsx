import { useTranslations } from 'next-intl';

import { Accordion } from '@/components/Accordion/Accordion';
import { AccordionItem } from '@/components/Accordion/AccordionItem';

// import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';

export function SupportFAQ() {
    const t = useTranslations('FAQ.Accordion');
    return (
        <div className="faq">
            {/* <div className="faq__top">
                <InputWithTitle title={'Enter your question'} />
            </div> */}
            <div className="main-content document-plate">
                <Accordion>
                    {Object.keys(t('')).map((key) => (
                        <AccordionItem title={t(`${Number(key) + 1}.Title`)}>
                            {t.rich(`${Number(key) + 1}.content`, {
                                div: (chunks) => (
                                    <div className="text-block" key={key}>
                                        {chunks}
                                    </div>
                                ),
                                p: (chunks) => <p>{chunks}</p>,
                                small: (chunks) => <small>{chunks}</small>,
                                ul: (chunks) => <ul>{chunks}</ul>,
                                li: (chunks) => <li>{chunks}</li>,
                            })}
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
