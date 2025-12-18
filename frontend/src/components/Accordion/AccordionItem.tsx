import { AnimatePresence, m } from 'framer-motion';
import Image from 'next/image';
import { PropsWithChildren, useState } from 'react';

interface Props extends PropsWithChildren {
    title: string;
}

export function AccordionItem({ children, title }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion-item">
            <div className="accordion-item__title" onClick={() => setIsOpen(!isOpen)}>
                <p>{title}</p>

                <Image
                    src={'/img/drop-arrow.svg'}
                    alt="arrow"
                    width={12}
                    height={12}
                    style={{ transform: !isOpen ? 'rotate(-90deg)' : 'rotate(0)', transition: '.3s all' }}
                />
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <m.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.8, ease: [0.04, 0.82, 0.23, 0.98] }}
                        exit="collapsed"
                        className="accordion-item__content"
                    >
                        {children}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
